import { useEffect, useRef, useState } from 'react'
import {
  Button, IconCloseOutlineRegular, IconFolderCloseRegular, IconPlusOutlineRegular, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { MultiWorkspaceRecord } from 'dsh-multi-workspace-host/types'
import { settleCreateFlow, subscribeCreateFlow } from './flowBridge.ts'
import type { MultiWorkspaceKey } from './locales.ts'
import css from './MultiWorkspaceFlow.module.css'

type Translate = (key: MultiWorkspaceKey) => string

export interface MultiWorkspaceInjected {
  pick: () => Promise<string | null>
  get: (workspaceId: WorkspaceId) => Promise<MultiWorkspaceRecord | null>
  remove: (workspaceId: WorkspaceId) => Promise<void>
  register: (workspaceId: WorkspaceId, paths: string[], primaryPath: string) => Promise<void>
  createWorkspace: (input: { path: string }) => Promise<WorkspaceView>
  renameWorkspace: (workspaceId: WorkspaceId, title: string) => Promise<void>
  deleteWorkspace: (workspaceId: WorkspaceId) => Promise<void>
  /** Current workspaces, read from the Host service (the slot hook may be absent). */
  listWorkspaces: () => WorkspaceView[]
  decorateWorkspaceMenu: boolean
}

type MultiWorkspaceFlowProps = PropsRuntime<'sidebar.workspaces.directoryFlow'>
  & MultiWorkspaceInjected
  & { t: Translate }

const folderName = (path: string): string => path.split(/[\\/]/u).filter(Boolean).at(-1) ?? path

/**
 * Put an edit button on every workspace row, immediately before the Host's own
 * ellipsis button. The row keeps the Host's classes so the control matches its
 * neighbours, and only one node is inserted — unlike cloning menu rows, this
 * cannot disturb a popover whose height is computed when it opens.
 */
function useWorkspaceRowAction({ enabled, label, resolve, open }: {
  enabled: boolean
  label: string
  resolve: (rowText: string) => WorkspaceView | undefined
  open: (workspace: WorkspaceView) => void
}): void {
  useEffect(() => {
    if (!enabled) return
    const decorate = (): void => {
      const rows = document.querySelectorAll<HTMLElement>('[role="treeitem"][aria-expanded]')
      for (const row of rows) {
        if (row.querySelector('[data-multi-workspace-edit]') !== null) continue
        const trigger = row.querySelector<HTMLButtonElement>('button[aria-haspopup], button[aria-expanded]')
        if (trigger === null) continue
        // Clone the Host's own ellipsis button so the control keeps its exact
        // geometry and hit area, then swap the glyph and drop the menu wiring.
        const button = trigger.cloneNode(true) as HTMLButtonElement
        button.dataset.multiWorkspaceEdit = ''
        button.removeAttribute('aria-haspopup')
        button.removeAttribute('aria-expanded')
        button.removeAttribute('aria-controls')
        button.setAttribute('aria-label', label)
        button.title = label
        const svg = button.querySelector('svg')
        if (svg !== null) {
          // A fresh SVG: the cloned one carries the Host icon's own fill/stroke
          // attributes, which would render the pencil as a solid blob.
          const pencil = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          pencil.setAttribute('width', svg.getAttribute('width') ?? '16')
          pencil.setAttribute('height', svg.getAttribute('height') ?? '16')
          pencil.setAttribute('viewBox', '0 0 24 24')
          pencil.setAttribute('fill', 'none')
          pencil.setAttribute('stroke', 'currentColor')
          pencil.setAttribute('stroke-width', '2')
          pencil.setAttribute('stroke-linecap', 'round')
          pencil.setAttribute('stroke-linejoin', 'round')
          pencil.setAttribute('aria-hidden', 'true')
          pencil.innerHTML = '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
          svg.replaceWith(pencil)
        } else {
          button.textContent = '✎'
        }
        // Capture phase: the row's own click handler (select/open) must not win.
        button.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopImmediatePropagation()
          const target = resolve(row.textContent?.trim() ?? '')
          if (target !== undefined) open(target)
        }, true)
        trigger.before(button)
      }
    }
    decorate()
    const observer = new MutationObserver(() => { decorate() })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect() }
  }, [enabled, label, resolve, open])
}

/** Add the plugin action to the Host-owned workspace menu until that menu gains a public item slot. */
function useWorkspaceMenuEditor({ enabled, workspaces, label, createLabel, open, create }: {
  enabled: boolean
  workspaces: readonly WorkspaceView[]
  label: string
  createLabel: string
  open: (workspace: WorkspaceView) => void
  create: () => void
}): void {
  const pending = useRef<WorkspaceView>()

  useEffect(() => {
    if (!enabled) return
    const identifyTrigger = (event: MouseEvent): void => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest('button')
      if (button === null) return
      const row = button.closest<HTMLElement>('[role="treeitem"][aria-expanded]')
      if (row === null) return
      // The row's own label is the only stable handle: the trailing control
      // count and the item labels change between DSH releases.
      const text = row.textContent?.trim() ?? ''
      pending.current = workspaces.find(workspace => workspace.title !== undefined && workspace.title === text)
        ?? workspaces.find(workspace => workspace.title !== undefined && workspace.title !== '' && text.includes(workspace.title))
        ?? workspaces.find(workspace => workspace.path !== undefined && text.includes(workspace.path))
    }

    const decorate = (menu: Element): void => {
      const workspace = pending.current
      if (workspace === undefined || menu.querySelector('[data-multi-workspace-edit]') !== null) return
      const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      // The Host's menu is rename + delete today; a later release may add rows,
      // so clone the first entry and anchor before the last (destructive) one.
      if (items.length < 2) return
      const templateWrap = items[0]?.parentElement
      const anchorWrap = items[items.length - 1]?.parentElement
      if (templateWrap === null || templateWrap === undefined || anchorWrap === null || anchorWrap === undefined) return
      /** Clone the Host's own rename row into a plugin-owned action. */
      const makeItem = (text: string, marker: string, run: () => void): HTMLElement | undefined => {
        const wrap = templateWrap.cloneNode(true) as HTMLElement
        const button = wrap.querySelector<HTMLButtonElement>('[role="menuitem"]')
        const labelEl = button?.querySelectorAll('span').item(1)
        if (button === null || button === undefined || labelEl === null || labelEl === undefined) return undefined
        wrap.dataset[marker] = ''
        labelEl.textContent = text
        button.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopImmediatePropagation()
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
          run()
        })
        return wrap
      }
      const editWrap = makeItem(label, 'multiWorkspaceEdit', () => { open(workspace) })
      const createWrap = makeItem(createLabel, 'multiWorkspaceCreate', create)
      if (editWrap !== undefined) anchorWrap.before(editWrap)
      if (createWrap !== undefined) anchorWrap.before(createWrap)
      pending.current = undefined
    }

    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue
          if (node.matches('[role="menu"]')) decorate(node)
          for (const menu of node.querySelectorAll('[role="menu"]')) decorate(menu)
        }
      }
    })
    document.addEventListener('click', identifyTrigger, true)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      document.removeEventListener('click', identifyTrigger, true)
      observer.disconnect()
    }
  }, [enabled, label, open, workspaces])
}

function FolderList({ paths, primaryPath, busy, removable, primarySelectable, t, onRemove, onPrimary, onAdd }: {
  paths: readonly string[]
  primaryPath: string | undefined
  busy: boolean
  removable: boolean
  primarySelectable: boolean
  t: Translate
  onRemove: (path: string) => void
  onPrimary: (path: string) => void
  onAdd: () => void
}) {
  if (paths.length === 0) {
    return (
      <button type="button" className={css.empty} disabled={busy} onClick={onAdd}>
        <IconFolderCloseRegular size={28} /><span>{t('empty')}</span>
      </button>
    )
  }
  return (
    <div className={css.folderList}>
      {paths.map(path => (
        <div className={css.folderRow} key={path}>
          <IconFolderCloseRegular size={16} />
          <div className={css.folderCopy}><strong>{folderName(path)}</strong><span>{path}</span></div>
          {path === primaryPath
            ? <span className={css.primary}>{t('primary')}</span>
            : primarySelectable && <Button className={css.setPrimary} size="sm" variant="toolbar" disabled={busy} aria-label={`${t('setPrimary')}: ${path}`} onClick={() => { onPrimary(path) }}>{t('setPrimary')}</Button>}
          {removable && path !== primaryPath
            ? (
                <button type="button" className={css.remove} aria-label={`${t('remove')}: ${path}`} title={t('remove')} disabled={busy} onClick={() => { onRemove(path) }}>
                  <IconCloseOutlineRegular />
                </button>
              )
            : <span className={css.removePlaceholder} />}
        </div>
      ))}
      <button type="button" className={css.addRow} disabled={busy} onClick={onAdd}>
        <IconPlusOutlineRegular size={16} />{t('add')}
      </button>
    </div>
  )
}

/** Create multi-folder projects and edit an existing project from its row menu. */
export function MultiWorkspaceFlow(props: MultiWorkspaceFlowProps) {
  // The slot may not declare the `useWorkspaces` hook in every DSH release.
  // A missing hook must degrade to an empty list instead of crashing the
  // render, which would retire this entry from the slot for good.
  const useWorkspaces = (typeof props.useWorkspaces === 'function'
    ? props.useWorkspaces
    : () => [] as WorkspaceView[]) as (selector: (state: { items: WorkspaceView[] }) => WorkspaceView[]) => WorkspaceView[]
  const workspaces = useWorkspaces((state: { items: WorkspaceView[] }) => state.items)
  const [createPaths, setCreatePaths] = useState<string[]>([])
  const [createTitle, setCreateTitle] = useState('')
  const [createPrimaryPath, setCreatePrimaryPath] = useState<string>()
  const [editTarget, setEditTarget] = useState<WorkspaceView>()
  const [editPaths, setEditPaths] = useState<string[]>([])
  const [editTitle, setEditTitle] = useState('')
  const [primaryPath, setPrimaryPath] = useState<string>()
  const [picking, setPicking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [error, setError] = useState<string>()
  const [forcedCreate, setForcedCreate] = useState(false)
  const openRef = useRef(false)

  // The wrapped `pickDirectory` parks a request here; opening the create dialog
  // is how the built-in add-workspace action reaches the multi-folder editor.
  // Only the sidebar instance owns it, so the hero instance cannot open a
  // second dialog for the same request.
  useEffect(() => {
    if (!props.decorateWorkspaceMenu) return undefined
    return subscribeCreateFlow(() => {
      setCreatePaths([])
      setCreateTitle('')
      setCreatePrimaryPath(undefined)
      setError(undefined)
      setForcedCreate(true)
    })
  }, [props.decorateWorkspaceMenu])

  // Workspaces the row action resolves against, read from the Host service when
  // the create surface opens.
  const [known, setKnown] = useState<WorkspaceView[]>([])
  useEffect(() => {
    if (!props.open && !forcedCreate) return
    try {
      setKnown(props.listWorkspaces())
    } catch (reason) {
      setKnown([])
      console.warn('[multi-workspace] could not list workspaces', reason)
    }
  }, [props.open, forcedCreate, props.listWorkspaces])
  const rowWorkspaces = known.length > 0 ? known : workspaces

  useWorkspaceRowAction({
    enabled: props.decorateWorkspaceMenu,
    label: props.t('editProject'),
    open: setEditTarget,
    resolve: (text) => {
      const pool = rowWorkspaces.length > 0 ? rowWorkspaces : (() => {
        try {
          return props.listWorkspaces()
        } catch {
          return [] as WorkspaceView[]
        }
      })()
      return pool.find(workspace => workspace.title !== undefined && workspace.title !== '' && text.includes(workspace.title))
        ?? pool.find(workspace => workspace.path !== undefined && text.includes(workspace.path))
    },
  })

  useWorkspaceMenuEditor({
    // Disabled: cloning rows into the Host's workspace menu corrupts its layout
    // on DSH 0.2.2 (the menu computes its height when it opens). The create flow
    // is reached through the `+` button, which owns the directory-flow slot, so
    // the plugin stays usable without touching the Host's menu.
    enabled: false,
    workspaces,
    label: props.t('editProject'),
    createLabel: props.t('newProject'),
    open: setEditTarget,
    create: () => {
      setCreatePaths([])
      setCreateTitle('')
      setCreatePrimaryPath(undefined)
      setError(undefined)
      setForcedCreate(true)
    },
  })

  useEffect(() => {
    if (props.open && !openRef.current) {
      setCreatePaths([])
      setCreateTitle('')
      setCreatePrimaryPath(undefined)
      setError(undefined)
    }
    openRef.current = props.open
  }, [props.open])

  useEffect(() => {
    if (editTarget === undefined) return
    let current = true
    setEditTitle(editTarget.title)
    setEditPaths([editTarget.path])
    setPrimaryPath(editTarget.path)
    setLoading(true)
    setError(undefined)
    props.get(editTarget.workspaceId).then(record => {
      if (!current) return
      setEditPaths(record?.paths ?? [editTarget.path])
      setPrimaryPath(record?.primaryPath ?? editTarget.path)
    }).catch(reason => {
      if (current) setError(reason instanceof Error ? reason.message : String(reason))
    }).finally(() => {
      if (current) setLoading(false)
    })
    return () => { current = false }
  }, [editTarget, props.get])

  const addFolder = (
    update: (callback: (current: string[]) => string[]) => void,
    onAdded?: (path: string) => void,
  ): void => {
    setPicking(true)
    setError(undefined)
    props.pick().then(path => {
      if (path !== null) {
        update(current => current.includes(path) ? current : [...current, path])
        onAdded?.(path)
      }
    }).catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setPicking(false) })
  }

  const create = (): void => {
    if (createPrimaryPath === undefined) return
    setCommitting(true)
    setError(undefined)
    void props.createWorkspace({ path: createPrimaryPath }).then(async workspace => {
      await props.register(workspace.workspaceId, createPaths, createPrimaryPath)
      const title = createTitle.trim()
      if (title !== '' && title !== workspace.title) await props.renameWorkspace(workspace.workspaceId, title)
      props.onPicked(createPrimaryPath)
      if (forcedCreate) {
        settleCreateFlow()
        setForcedCreate(false)
      }
    }).catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setCommitting(false) })
  }

  const save = (): void => {
    if (editTarget === undefined || primaryPath === undefined) return
    setCommitting(true)
    setError(undefined)
    void props.register(editTarget.workspaceId, editPaths, primaryPath).then(async () => {
      const title = editTitle.trim()
      if (title !== '' && title !== editTarget.title) await props.renameWorkspace(editTarget.workspaceId, title)
      setEditTarget(undefined)
    }).catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setCommitting(false) })
  }

  const removeProject = (): void => {
    if (editTarget === undefined) return
    setCommitting(true)
    setError(undefined)
    void props.deleteWorkspace(editTarget.workspaceId).then(async () => { await props.remove(editTarget.workspaceId) })
      .then(() => { setEditTarget(undefined) })
      .catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setCommitting(false) })
  }

  const busy = picking || loading || committing || props.busy
  const closeEditor = (): void => { if (!committing) setEditTarget(undefined) }
  /** Close the create dialog and release the parked `pickDirectory` call. */
  const cancelCreate = (): void => {
    if (forcedCreate) {
      settleCreateFlow()
      setForcedCreate(false)
    }
    props.onCancel()
  }

  return (
    <>
      <Modal
        open={props.open || forcedCreate}
        onClose={cancelCreate}
        closeLabel={props.t('cancel')}
        title={props.t('createTitle')}
        className={css.dialog!}
        contentClassName={css.content!}
        footer={<>
          <Button variant="ghost" onClick={cancelCreate}>{props.t('cancel')}</Button>
          <Button variant="primary" disabled={busy || createPaths.length === 0 || createPrimaryPath === undefined} onClick={create}>
            {committing ? props.t('creating') : props.t('create')}
          </Button>
        </>}
      >
        <div className={css.body}>
          <label className={css.nameField}>
            <IconFolderCloseRegular size={18} />
            <input aria-label={props.t('name')} value={createTitle} placeholder={props.t('name')} onChange={event => { setCreateTitle(event.target.value) }} />
          </label>
          <section className={css.folderSection} aria-label={props.t('folders')}>
            <h3>{props.t('folders')}</h3>
            <FolderList
              paths={createPaths} primaryPath={createPrimaryPath} busy={busy} removable={false} primarySelectable t={props.t}
              onRemove={() => {}} onPrimary={setCreatePrimaryPath}
              onAdd={() => { addFolder(setCreatePaths, path => { setCreatePrimaryPath(current => current ?? path) }) }}
            />
          </section>

          {error !== undefined && <div className={css.error} role="alert">{error}</div>}
        </div>
      </Modal>

      <Modal
        open={editTarget !== undefined}
        onClose={closeEditor}
        closeLabel={props.t('cancel')}
        title={props.t('editTitle')}
        className={css.dialog!}
        contentClassName={css.content!}
        footer={<div className={css.editFooter}>
          <button type="button" className={css.danger} disabled={busy} onClick={removeProject}>{props.t('removeProject')}</button>
          <span className={css.footerActions}>
            <Button variant="ghost" onClick={closeEditor}>{props.t('cancel')}</Button>
            <Button variant="primary" disabled={busy || editPaths.length === 0 || editTitle.trim() === '' || primaryPath === undefined} onClick={save}>
              {committing ? props.t('saving') : props.t('save')}
            </Button>
          </span>
        </div>}
      >
        <div className={css.body}>
          <label className={css.nameField}>
            <IconFolderCloseRegular size={18} />
            <input aria-label={props.t('name')} value={editTitle} placeholder={props.t('name')} disabled={busy} onChange={event => { setEditTitle(event.target.value) }} />
          </label>
          <section className={css.folderSection} aria-label={props.t('folders')}>
            <h3>{props.t('folders')}</h3>
            {loading
              ? <div className={css.status} role="status">{props.t('loading')}</div>
              : (
                  <FolderList
                    paths={editPaths} primaryPath={primaryPath} busy={busy} removable primarySelectable t={props.t}
                    onRemove={path => {
                      setEditPaths(current => current.filter(item => item !== path))
                    }}
                    onPrimary={setPrimaryPath}
                    onAdd={() => { addFolder(setEditPaths) }}
                  />
                )}
          </section>
          {error !== undefined && <div className={css.error} role="alert">{error}</div>}
        </div>
      </Modal>
    </>
  )
}
