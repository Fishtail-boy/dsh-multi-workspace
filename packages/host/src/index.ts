/** Host persistence and model context for multi-project workspaces. */
import { readFileSync } from 'node:fs'
import { mkdir, realpath, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { Context, Service } from '@deepseek-ai/cordis'
import { createUserMessage, type ContextFormed } from '@deepseek-ai/dsh-llm'
import type { Agent, PreStepDecision } from '@deepseek-ai/dsh-agent'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import type { MultiWorkspaceRecord } from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'multi-workspace': { readonly kind: 'multi-workspace' } & ContextFormed
  }
}

const PLUGIN = 'multi-workspace'
const STORE_VERSION = 1
const filePath = (): string => join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'multi-workspaces.json')

interface MultiWorkspaceStore {
  version: typeof STORE_VERSION
  projects: MultiWorkspaceRecord[]
}

interface WorkspacePort {
  readonly id: string
  readonly path: string
  readonly sessionIds: readonly SessionId[]
}

interface WorkspaceRegistryPort {
  get(id: string): WorkspacePort | undefined
  list(): readonly WorkspacePort[]
  setPath(id: string, path: string): Promise<void>
}

interface SandboxPolicyPort {
  registerAdditionalWritableRoots(provider: (session: Session) => readonly string[]): () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    multiWorkspaceRegistry: MultiWorkspaceRegistry
  }
}

/** Durable registry for the extra folders attached to one native workspace. */
export class MultiWorkspaceRegistry extends Service {
  static inject = ['workspaceRegistry', 'sandboxPolicy']
  private records = new Map<string, MultiWorkspaceRecord>()

  constructor(ctx: Context) {
    super(ctx, 'multiWorkspaceRegistry')
    this.load()
  }

  private get workspaceRegistry(): WorkspaceRegistryPort {
    return this.ctx.get('workspaceRegistry') as WorkspaceRegistryPort
  }

  private get sandboxPolicy(): SandboxPolicyPort {
    return this.ctx.get('sandboxPolicy') as SandboxPolicyPort
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(filePath()), { recursive: true })
    const store: MultiWorkspaceStore = { version: STORE_VERSION, projects: [...this.records.values()] }
    await writeFile(filePath(), `${JSON.stringify(store, null, 2)}\n`)
  }

  private load(): void {
    let source: string
    try {
      source = readFileSync(filePath(), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
      throw error
    }
    const parsed = JSON.parse(source) as Partial<MultiWorkspaceStore>
    if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.projects)) {
      throw new Error(`multi-workspace: unsupported registry format in ${filePath()}`)
    }
    for (const item of parsed.projects) {
      if (typeof item.workspaceId !== 'string' || !Array.isArray(item.paths)
        || item.paths.some(path => typeof path !== 'string')
        || typeof item.primaryPath !== 'string' || typeof item.updatedAt !== 'string') {
        throw new Error(`multi-workspace: invalid project record in ${filePath()}`)
      }
      const paths = [...new Set(item.paths.map(path => resolve(path)))]
      const primaryPath = resolve(item.primaryPath)
      if (!paths.includes(primaryPath)) {
        throw new Error(`multi-workspace: primary folder is absent from project '${item.workspaceId}'`)
      }
      this.records.set(item.workspaceId, { ...item, paths, primaryPath })
    }
  }

  private async normalizeDirectory(path: string): Promise<string> {
    const canonical = await realpath(path)
    if (!(await stat(canonical)).isDirectory()) throw new Error(`multi-workspace: '${path}' is not a directory`)
    return canonical
  }

  async register(workspaceId: string, paths: string[], primaryPath: string): Promise<MultiWorkspaceRecord> {
    const workspace = this.workspaceRegistry.get(workspaceId)
    if (workspace === undefined) throw new Error(`multi-workspace: unknown workspace '${workspaceId}'`)
    const normalized = [...new Set(await Promise.all(paths.map(path => this.normalizeDirectory(path))))]
    const primary = await this.normalizeDirectory(primaryPath)
    if (!normalized.includes(primary)) throw new Error('multi-workspace: primary folder must be registered')

    const previous = this.records.get(workspaceId)
    const previousPath = workspace.path
    const record = { workspaceId, paths: normalized, primaryPath: primary, updatedAt: new Date().toISOString() }
    await this.workspaceRegistry.setPath(workspaceId, primary)
    this.records.set(workspaceId, record)
    try {
      await this.persist()
    } catch (error) {
      if (previous === undefined) this.records.delete(workspaceId)
      else this.records.set(workspaceId, previous)
      try {
        await this.workspaceRegistry.setPath(workspaceId, previousPath)
      } catch (rollbackError) {
        throw new AggregateError([error, rollbackError], `multi-workspace: project '${workspaceId}' save and primary-folder rollback both failed`)
      }
      throw error
    }
    return record
  }

  async remove(workspaceId: string): Promise<boolean> {
    const removed = this.records.delete(workspaceId)
    if (removed) await this.persist()
    return removed
  }

  get(workspaceId: string): MultiWorkspaceRecord | null {
    return this.records.get(workspaceId) ?? null
  }

  private recordForSession(sessionId: SessionId): MultiWorkspaceRecord | undefined {
    const workspace = this.workspaceRegistry.list().find(candidate => candidate.sessionIds.includes(sessionId))
    return workspace === undefined ? undefined : this.records.get(String(workspace.id))
  }

  private additionalWritableRoots(session: Session): readonly string[] {
    return this.recordForSession(session.id)?.paths ?? []
  }

  private async injectContext({ agent, step, signal }: { agent: Agent; step: number; signal: AbortSignal }, next: () => Promise<PreStepDecision>): Promise<PreStepDecision> {
    const decision = await next()
    if (decision.kind === 'reject' || signal.aborted || step !== 1) return decision
    const record = this.recordForSession(agent.session.id)
    if (record === undefined || record.paths.length < 2) return decision
    const text = [
      'The current project contains multiple attached folders.',
      `Primary project folder: ${record.primaryPath}`,
      'Attached project folders:',
      ...record.paths.map(path => `- ${path}`),
      'Resolve relative paths from the primary project folder. Use absolute paths for another attached folder.',
    ].join('\n')
    return { kind: 'enter', messages: [createUserMessage({ content: [{ type: 'text', text }], source: { kind: PLUGIN, form: 'snapshot', sections: [{ name: PLUGIN, text }] } }), ...decision.messages] }
  }

  installPrompt(): void {
    this.ctx.on('agent/pre-step', (payload, next) => this.injectContext(payload, next), { prepend: true })
    this.ctx.effect(
      () => this.sandboxPolicy.registerAdditionalWritableRoots(session => this.additionalWritableRoots(session)),
      'multi-workspace.additionalWritableRoots',
    )
  }
}

/** Remote gateway exposed to the browser half. */
export class MultiWorkspaceGateway extends TypertRemoteService {
  static inject = ['multiWorkspaceRegistry']
  constructor(ctx: Context) { super(ctx, 'multiWorkspace') }
  @Remote('register') async register(workspaceId: string, paths: string[], primaryPath: string): Promise<MultiWorkspaceRecord> { return this.ctx.multiWorkspaceRegistry.register(workspaceId, paths, primaryPath) }
  @Remote('get') async get(workspaceId: string): Promise<MultiWorkspaceRecord | null> { return this.ctx.multiWorkspaceRegistry.get(workspaceId) }
  @Remote('delete') async delete(workspaceId: string): Promise<boolean> { return this.ctx.multiWorkspaceRegistry.remove(workspaceId) }
}

export const inject = ['workspaceRegistry', 'sandboxPolicy']
export function apply(ctx: Context): void {
  ctx.plugin(MultiWorkspaceRegistry)
  ctx.inject(['multiWorkspaceRegistry'], (ready) => {
    ready.multiWorkspaceRegistry.installPrompt()
    ready.plugin(MultiWorkspaceGateway)
  })
}

export default apply
