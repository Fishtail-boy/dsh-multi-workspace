var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
/** Host persistence and model context for multi-project workspaces. */
import { readFileSync } from 'node:fs';
import { mkdir, realpath, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Service } from '@deepseek-ai/cordis';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
const PLUGIN = 'multi-workspace';
const STORE_VERSION = 1;
const filePath = () => join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'multi-workspaces.json');
/** Durable registry for the extra folders attached to one native workspace. */
export class MultiWorkspaceRegistry extends Service {
    static inject = ['workspaceRegistry', 'sandboxPolicy'];
    records = new Map();
    constructor(ctx) {
        super(ctx, 'multiWorkspaceRegistry');
        this.load();
    }
    get workspaceRegistry() {
        return this.ctx.get('workspaceRegistry');
    }
    get sandboxPolicy() {
        return this.ctx.get('sandboxPolicy');
    }
    async persist() {
        await mkdir(dirname(filePath()), { recursive: true });
        const store = { version: STORE_VERSION, projects: [...this.records.values()] };
        await writeFile(filePath(), `${JSON.stringify(store, null, 2)}\n`);
    }
    load() {
        let source;
        try {
            source = readFileSync(filePath(), 'utf8');
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return;
            throw error;
        }
        const parsed = JSON.parse(source);
        if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.projects)) {
            throw new Error(`multi-workspace: unsupported registry format in ${filePath()}`);
        }
        for (const item of parsed.projects) {
            if (typeof item.workspaceId !== 'string' || !Array.isArray(item.paths)
                || item.paths.some(path => typeof path !== 'string')
                || typeof item.primaryPath !== 'string' || typeof item.updatedAt !== 'string') {
                throw new Error(`multi-workspace: invalid project record in ${filePath()}`);
            }
            const paths = [...new Set(item.paths.map(path => resolve(path)))];
            const primaryPath = resolve(item.primaryPath);
            if (!paths.includes(primaryPath)) {
                throw new Error(`multi-workspace: primary folder is absent from project '${item.workspaceId}'`);
            }
            this.records.set(item.workspaceId, { ...item, paths, primaryPath });
        }
    }
    async normalizeDirectory(path) {
        const canonical = await realpath(path);
        if (!(await stat(canonical)).isDirectory())
            throw new Error(`multi-workspace: '${path}' is not a directory`);
        return canonical;
    }
    async register(workspaceId, paths, primaryPath) {
        const workspace = this.workspaceRegistry.get(workspaceId);
        if (workspace === undefined)
            throw new Error(`multi-workspace: unknown workspace '${workspaceId}'`);
        const normalized = [...new Set(await Promise.all(paths.map(path => this.normalizeDirectory(path))))];
        const primary = await this.normalizeDirectory(primaryPath);
        if (!normalized.includes(primary))
            throw new Error('multi-workspace: primary folder must be registered');
        const previous = this.records.get(workspaceId);
        const previousPath = workspace.path;
        const record = { workspaceId, paths: normalized, primaryPath: primary, updatedAt: new Date().toISOString() };
        await this.setWorkspacePath(workspaceId, primary);
        this.records.set(workspaceId, record);
        try {
            await this.persist();
        }
        catch (error) {
            if (previous === undefined)
                this.records.delete(workspaceId);
            else
                this.records.set(workspaceId, previous);
            try {
                await this.setWorkspacePath(workspaceId, previousPath);
            }
            catch (rollbackError) {
                throw new AggregateError([error, rollbackError], `multi-workspace: project '${workspaceId}' save and primary-folder rollback both failed`);
            }
            throw error;
        }
        return record;
    }
    /**
     * Point the native workspace at the chosen primary folder.
     *
     * The workspace registry renamed this operation across DSH releases, and a
     * missing setter must not fail the save: the extra-folder mapping and the
     * model context are the parts that matter, so an unsettable path degrades to
     * "the native root stays the primary folder".
     */
    async setWorkspacePath(workspaceId, path) {
        const registry = this.workspaceRegistry;
        for (const method of ['setPath', 'updatePath', 'setRootPath', 'movePath', 'setPrimaryPath']) {
            const candidate = registry[method];
            if (typeof candidate === 'function') {
                await candidate.call(registry, workspaceId, path);
                return;
            }
        }
        console.info('[mws-host] workspaceRegistry exposes no path setter; keeping the native root as primary');
    }
    async remove(workspaceId) {
        const removed = this.records.delete(workspaceId);
        if (removed)
            await this.persist();
        return removed;
    }
    get(workspaceId) {
        return this.records.get(workspaceId) ?? null;
    }
    recordForSession(sessionId) {
        const workspace = this.workspaceRegistry.list().find(candidate => candidate.sessionIds.includes(sessionId));
        return workspace === undefined ? undefined : this.records.get(String(workspace.id));
    }
    additionalWritableRoots(session) {
        return this.recordForSession(session.id)?.paths ?? [];
    }
    async injectContext({ agent, step, signal }, next) {
        const decision = await next();
        if (decision.kind === 'reject' || signal.aborted || step !== 1)
            return decision;
        const record = this.recordForSession(agent.session.id);
        if (record === undefined || record.paths.length < 2)
            return decision;
        const text = [
            'The current project contains multiple attached folders.',
            `Primary project folder: ${record.primaryPath}`,
            'Attached project folders:',
            ...record.paths.map(path => `- ${path}`),
            'Resolve relative paths from the primary project folder. Use absolute paths for another attached folder.',
        ].join('\n');
        return { kind: 'enter', messages: [createUserMessage({ content: [{ type: 'text', text }], source: { kind: PLUGIN, form: 'snapshot', sections: [{ name: PLUGIN, text }] } }), ...decision.messages] };
    }
    installPrompt() {
        this.ctx.on('agent/pre-step', (payload, next) => this.injectContext(payload, next), { prepend: true });
        // `registerAdditionalWritableRoots` exists on some DSH releases only. A
        // missing capability must not abort the rest of the plugin: the model
        // context injection above is the part that matters, and the attached
        // folders stay readable through the primary root either way.
        const policy = this.sandboxPolicy;
        if (typeof policy.registerAdditionalWritableRoots !== 'function') {
            console.info('[mws-host] sandboxPolicy has no registerAdditionalWritableRoots; extra folders stay non-writable');
            return;
        }
        this.ctx.effect(() => this.sandboxPolicy.registerAdditionalWritableRoots(session => this.additionalWritableRoots(session)), 'multi-workspace.additionalWritableRoots');
    }
}
/** Remote gateway exposed to the browser half. */
let MultiWorkspaceGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _register_decorators;
    let _get_decorators;
    let _delete_decorators;
    return class MultiWorkspaceGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _register_decorators = [Remote('register')];
            _get_decorators = [Remote('get')];
            _delete_decorators = [Remote('delete')];
            __esDecorate(this, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: obj => "register" in obj, get: obj => obj.register }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_decorators, { kind: "method", name: "get", static: false, private: false, access: { has: obj => "get" in obj, get: obj => obj.get }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['multiWorkspaceRegistry'];
        constructor(ctx) {
            super(ctx, 'multiWorkspace');
            __runInitializers(this, _instanceExtraInitializers);
        }
        async register(workspaceId, paths, primaryPath) { return this.ctx.multiWorkspaceRegistry.register(workspaceId, paths, primaryPath); }
        async get(workspaceId) { return this.ctx.multiWorkspaceRegistry.get(workspaceId); }
        async delete(workspaceId) { return this.ctx.multiWorkspaceRegistry.remove(workspaceId); }
    };
})();
export { MultiWorkspaceGateway };
export const inject = ['workspaceRegistry', 'sandboxPolicy'];
export function apply(ctx) {
    ctx.plugin(MultiWorkspaceRegistry);
    ctx.inject(['multiWorkspaceRegistry'], (ready) => {
        try {
            ready.multiWorkspaceRegistry.installPrompt();
        }
        catch (error) {
            console.error('[mws-host] installPrompt failed', error);
        }
        try {
            ready.plugin(MultiWorkspaceGateway);
        }
        catch (error) {
            console.error('[mws-host] gateway mount failed', error);
        }
    });
}
export default apply;
//# sourceMappingURL=index.js.map