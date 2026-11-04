import { useEffect, useRef, useState } from 'react'
import {
  Button, IconCloseOutlineRegular, IconFolderCloseRegular, IconPlusOutlineRegular, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { MultiWorkspaceRecord } from 'dsh-multi-workspace-host/types'
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
  decorateWorkspaceMenu: boolean
}

type MultiWorkspaceFlowProps = PropsRuntime<'sidebar.workspaces.directoryFlow'>
  & MultiWorkspaceInjected
  & { t: Translate }

const folderName = (path: string): string => path.split(/[\\/]/u).filter(Boolean).at(-1) ?? path

/** Add the plugin action to the Host-owned workspace menu until that menu gains a public item slot. */
function useWorkspaceMenuEditor({ enabled, workspaces, label, open }: {
  enabled: boolean
  workspaces: readonly WorkspaceView[]
  label: string
  open: (workspace: WorkspaceView) => void
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
      const buttons = [...row.querySelectorAll('button')]
      if (button !== buttons.at(-2)) return
      const title = row.textContent?.trim()
      pending.current = workspaces.find(workspace => workspace.title === title)
    }

    const decorate = (menu: Element): void => {
      const workspace = pending.current
      if (workspace === undefined || menu.querySelector('[data-multi-workspace-edit]') !== null) return
      const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      if (items.length !== 2) return
      const renameWrap = items[0]?.parentElement
      const deleteWrap = items[1]?.parentElement
      if (renameWrap === null || renameWrap === undefined || deleteWrap === null || deleteWrap === undefined) return
      const editWrap = renameWrap.cloneNode(true) as HTMLElement
      const editButton = editWrap.querySelector<HTMLButtonElement>('[role="menuitem"]')
      const editLabel = editButton?.querySelectorAll('span').item(1)
      if (editButton === null || editButton === undefined || editLabel === null || editLabel === undefined) return
      editWrap.dataset.multiWorkspaceEdit = ''
      editLabel.textContent = label
      editButton.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopImmediatePropagation()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        open(workspace)
      })
      deleteWrap.before(editWrap)
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
  const workspaces = props.useWorkspaces((state: { items: WorkspaceView[] }) => state.items)
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
  const openRef = useRef(false)

  useWorkspaceMenuEditor({
    enabled: props.decorateWorkspaceMenu,
    workspaces,
    label: props.t('editProject'),
    open: setEditTarget,
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

  return (
    <>
      <Modal
        open={props.open}
        onClose={props.onCancel}
        closeLabel={props.t('cancel')}
        title={props.t('createTitle')}
        className={css.dialog!}
        contentClassName={css.content!}
        footer={<>
          <Button variant="ghost" onClick={props.onCancel}>{props.t('cancel')}</Button>
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
