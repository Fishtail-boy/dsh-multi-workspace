import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Button, IconCloseOutlineRegular, IconFolderCloseRegular, IconPlusOutlineRegular, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import { settleCreateFlow, subscribeCreateFlow } from "./flowBridge.js";
import css from './MultiWorkspaceFlow.module.css';
const folderName = (path) => path.split(/[\\/]/u).filter(Boolean).at(-1) ?? path;
/** Add the plugin action to the Host-owned workspace menu until that menu gains a public item slot. */
function useWorkspaceMenuEditor({ enabled, workspaces, label, createLabel, open, create }) {
    const pending = useRef();
    useEffect(() => {
        if (!enabled)
            return;
        const identifyTrigger = (event) => {
            if (!(event.target instanceof Element))
                return;
            const button = event.target.closest('button');
            if (button === null)
                return;
            const row = button.closest('[role="treeitem"][aria-expanded]');
            if (row === null)
                return;
            const buttons = [...row.querySelectorAll('button')];
            if (button !== buttons.at(-2))
                return;
            const title = row.textContent?.trim();
            pending.current = workspaces.find(workspace => workspace.title === title);
        };
        const decorate = (menu) => {
            const workspace = pending.current;
            if (workspace === undefined || menu.querySelector('[data-multi-workspace-edit]') !== null)
                return;
            const items = [...menu.querySelectorAll('[role="menuitem"]')];
            if (items.length !== 2)
                return;
            const renameWrap = items[0]?.parentElement;
            const deleteWrap = items[1]?.parentElement;
            if (renameWrap === null || renameWrap === undefined || deleteWrap === null || deleteWrap === undefined)
                return;
            /** Clone the Host's own rename row into a plugin-owned action. */
            const makeItem = (text, marker, run) => {
                const wrap = renameWrap.cloneNode(true);
                const button = wrap.querySelector('[role="menuitem"]');
                const labelEl = button?.querySelectorAll('span').item(1);
                if (button === null || button === undefined || labelEl === null || labelEl === undefined)
                    return undefined;
                wrap.dataset[marker] = '';
                labelEl.textContent = text;
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                    run();
                });
                return wrap;
            };
            const editWrap = makeItem(label, 'multiWorkspaceEdit', () => { open(workspace); });
            const createWrap = makeItem(createLabel, 'multiWorkspaceCreate', create);
            if (editWrap !== undefined)
                deleteWrap.before(editWrap);
            if (createWrap !== undefined)
                deleteWrap.before(createWrap);
            pending.current = undefined;
        };
        const observer = new MutationObserver(records => {
            for (const record of records) {
                for (const node of record.addedNodes) {
                    if (!(node instanceof Element))
                        continue;
                    if (node.matches('[role="menu"]'))
                        decorate(node);
                    for (const menu of node.querySelectorAll('[role="menu"]'))
                        decorate(menu);
                }
            }
        });
        document.addEventListener('click', identifyTrigger, true);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => {
            document.removeEventListener('click', identifyTrigger, true);
            observer.disconnect();
        };
    }, [enabled, label, open, workspaces]);
}
function FolderList({ paths, primaryPath, busy, removable, primarySelectable, t, onRemove, onPrimary, onAdd }) {
    if (paths.length === 0) {
        return (_jsxs("button", { type: "button", className: css.empty, disabled: busy, onClick: onAdd, children: [_jsx(IconFolderCloseRegular, { size: 28 }), _jsx("span", { children: t('empty') })] }));
    }
    return (_jsxs("div", { className: css.folderList, children: [paths.map(path => (_jsxs("div", { className: css.folderRow, children: [_jsx(IconFolderCloseRegular, { size: 16 }), _jsxs("div", { className: css.folderCopy, children: [_jsx("strong", { children: folderName(path) }), _jsx("span", { children: path })] }), path === primaryPath
                        ? _jsx("span", { className: css.primary, children: t('primary') })
                        : primarySelectable && _jsx(Button, { className: css.setPrimary, size: "sm", variant: "toolbar", disabled: busy, "aria-label": `${t('setPrimary')}: ${path}`, onClick: () => { onPrimary(path); }, children: t('setPrimary') }), removable && path !== primaryPath
                        ? (_jsx("button", { type: "button", className: css.remove, "aria-label": `${t('remove')}: ${path}`, title: t('remove'), disabled: busy, onClick: () => { onRemove(path); }, children: _jsx(IconCloseOutlineRegular, {}) }))
                        : _jsx("span", { className: css.removePlaceholder })] }, path))), _jsxs("button", { type: "button", className: css.addRow, disabled: busy, onClick: onAdd, children: [_jsx(IconPlusOutlineRegular, { size: 16 }), t('add')] })] }));
}
/** Create multi-folder projects and edit an existing project from its row menu. */
export function MultiWorkspaceFlow(props) {
    // The slot may not declare the `useWorkspaces` hook in every DSH release.
    // A missing hook must degrade to an empty list instead of crashing the
    // render, which would retire this entry from the slot for good.
    const useWorkspaces = (typeof props.useWorkspaces === 'function'
        ? props.useWorkspaces
        : () => []);
    const workspaces = useWorkspaces((state) => state.items);
    const [createPaths, setCreatePaths] = useState([]);
    const [createTitle, setCreateTitle] = useState('');
    const [createPrimaryPath, setCreatePrimaryPath] = useState();
    const [editTarget, setEditTarget] = useState();
    const [editPaths, setEditPaths] = useState([]);
    const [editTitle, setEditTitle] = useState('');
    const [primaryPath, setPrimaryPath] = useState();
    const [picking, setPicking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [committing, setCommitting] = useState(false);
    const [error, setError] = useState();
    const [forcedCreate, setForcedCreate] = useState(false);
    const openRef = useRef(false);
    // The wrapped `pickDirectory` parks a request here; opening the create dialog
    // is how the built-in add-workspace action reaches the multi-folder editor.
    // Only the sidebar instance owns it, so the hero instance cannot open a
    // second dialog for the same request.
    useEffect(() => {
        if (!props.decorateWorkspaceMenu)
            return undefined;
        return subscribeCreateFlow(() => {
            setCreatePaths([]);
            setCreateTitle('');
            setCreatePrimaryPath(undefined);
            setError(undefined);
            setForcedCreate(true);
        });
    }, [props.decorateWorkspaceMenu]);
    useWorkspaceMenuEditor({
        enabled: props.decorateWorkspaceMenu,
        workspaces,
        label: props.t('editProject'),
        createLabel: props.t('newProject'),
        open: setEditTarget,
        create: () => {
            setCreatePaths([]);
            setCreateTitle('');
            setCreatePrimaryPath(undefined);
            setError(undefined);
            setForcedCreate(true);
        },
    });
    useEffect(() => {
        if (props.open && !openRef.current) {
            setCreatePaths([]);
            setCreateTitle('');
            setCreatePrimaryPath(undefined);
            setError(undefined);
        }
        openRef.current = props.open;
    }, [props.open]);
    useEffect(() => {
        if (editTarget === undefined)
            return;
        let current = true;
        setEditTitle(editTarget.title);
        setEditPaths([editTarget.path]);
        setPrimaryPath(editTarget.path);
        setLoading(true);
        setError(undefined);
        props.get(editTarget.workspaceId).then(record => {
            if (!current)
                return;
            setEditPaths(record?.paths ?? [editTarget.path]);
            setPrimaryPath(record?.primaryPath ?? editTarget.path);
        }).catch(reason => {
            if (current)
                setError(reason instanceof Error ? reason.message : String(reason));
        }).finally(() => {
            if (current)
                setLoading(false);
        });
        return () => { current = false; };
    }, [editTarget, props.get]);
    const addFolder = (update, onAdded) => {
        setPicking(true);
        setError(undefined);
        props.pick().then(path => {
            if (path !== null) {
                update(current => current.includes(path) ? current : [...current, path]);
                onAdded?.(path);
            }
        }).catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)); })
            .finally(() => { setPicking(false); });
    };
    const create = () => {
        if (createPrimaryPath === undefined)
            return;
        setCommitting(true);
        setError(undefined);
        void props.createWorkspace({ path: createPrimaryPath }).then(async (workspace) => {
            await props.register(workspace.workspaceId, createPaths, createPrimaryPath);
            const title = createTitle.trim();
            if (title !== '' && title !== workspace.title)
                await props.renameWorkspace(workspace.workspaceId, title);
            props.onPicked(createPrimaryPath);
            if (forcedCreate) {
                settleCreateFlow();
                setForcedCreate(false);
            }
        }).catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)); })
            .finally(() => { setCommitting(false); });
    };
    const save = () => {
        if (editTarget === undefined || primaryPath === undefined)
            return;
        setCommitting(true);
        setError(undefined);
        void props.register(editTarget.workspaceId, editPaths, primaryPath).then(async () => {
            const title = editTitle.trim();
            if (title !== '' && title !== editTarget.title)
                await props.renameWorkspace(editTarget.workspaceId, title);
            setEditTarget(undefined);
        }).catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)); })
            .finally(() => { setCommitting(false); });
    };
    const removeProject = () => {
        if (editTarget === undefined)
            return;
        setCommitting(true);
        setError(undefined);
        void props.deleteWorkspace(editTarget.workspaceId).then(async () => { await props.remove(editTarget.workspaceId); })
            .then(() => { setEditTarget(undefined); })
            .catch(reason => { setError(reason instanceof Error ? reason.message : String(reason)); })
            .finally(() => { setCommitting(false); });
    };
    const busy = picking || loading || committing || props.busy;
    const closeEditor = () => { if (!committing)
        setEditTarget(undefined); };
    /** Close the create dialog and release the parked `pickDirectory` call. */
    const cancelCreate = () => {
        if (forcedCreate) {
            settleCreateFlow();
            setForcedCreate(false);
        }
        props.onCancel();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { open: props.open || forcedCreate, onClose: cancelCreate, closeLabel: props.t('cancel'), title: props.t('createTitle'), className: css.dialog, contentClassName: css.content, footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: cancelCreate, children: props.t('cancel') }), _jsx(Button, { variant: "primary", disabled: busy || createPaths.length === 0 || createPrimaryPath === undefined, onClick: create, children: committing ? props.t('creating') : props.t('create') })] }), children: _jsxs("div", { className: css.body, children: [_jsxs("label", { className: css.nameField, children: [_jsx(IconFolderCloseRegular, { size: 18 }), _jsx("input", { "aria-label": props.t('name'), value: createTitle, placeholder: props.t('name'), onChange: event => { setCreateTitle(event.target.value); } })] }), _jsxs("section", { className: css.folderSection, "aria-label": props.t('folders'), children: [_jsx("h3", { children: props.t('folders') }), _jsx(FolderList, { paths: createPaths, primaryPath: createPrimaryPath, busy: busy, removable: false, primarySelectable: true, t: props.t, onRemove: () => { }, onPrimary: setCreatePrimaryPath, onAdd: () => { addFolder(setCreatePaths, path => { setCreatePrimaryPath(current => current ?? path); }); } })] }), error !== undefined && _jsx("div", { className: css.error, role: "alert", children: error })] }) }), _jsx(Modal, { open: editTarget !== undefined, onClose: closeEditor, closeLabel: props.t('cancel'), title: props.t('editTitle'), className: css.dialog, contentClassName: css.content, footer: _jsxs("div", { className: css.editFooter, children: [_jsx("button", { type: "button", className: css.danger, disabled: busy, onClick: removeProject, children: props.t('removeProject') }), _jsxs("span", { className: css.footerActions, children: [_jsx(Button, { variant: "ghost", onClick: closeEditor, children: props.t('cancel') }), _jsx(Button, { variant: "primary", disabled: busy || editPaths.length === 0 || editTitle.trim() === '' || primaryPath === undefined, onClick: save, children: committing ? props.t('saving') : props.t('save') })] })] }), children: _jsxs("div", { className: css.body, children: [_jsxs("label", { className: css.nameField, children: [_jsx(IconFolderCloseRegular, { size: 18 }), _jsx("input", { "aria-label": props.t('name'), value: editTitle, placeholder: props.t('name'), disabled: busy, onChange: event => { setEditTitle(event.target.value); } })] }), _jsxs("section", { className: css.folderSection, "aria-label": props.t('folders'), children: [_jsx("h3", { children: props.t('folders') }), loading
                                    ? _jsx("div", { className: css.status, role: "status", children: props.t('loading') })
                                    : (_jsx(FolderList, { paths: editPaths, primaryPath: primaryPath, busy: busy, removable: true, primarySelectable: true, t: props.t, onRemove: path => {
                                            setEditPaths(current => current.filter(item => item !== path));
                                        }, onPrimary: setPrimaryPath, onAdd: () => { addFolder(setEditPaths); } }))] }), error !== undefined && _jsx("div", { className: css.error, role: "alert", children: error })] }) })] }));
}
//# sourceMappingURL=MultiWorkspaceFlow.js.map