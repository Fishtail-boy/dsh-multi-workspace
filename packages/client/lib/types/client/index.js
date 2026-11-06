import multiWorkspaceRemote from 'dsh-multi-workspace-host/remote';
import { MultiWorkspaceFlow } from "./MultiWorkspaceFlow.js";
import { en, zh } from "./locales.js";
const NS = 'multi-workspace';
/**
 * Services the directory-flow UI renders against. `remote.multiWorkspace` is
 * deliberately absent: the dialog resolves it lazily inside the injected
 * callbacks, so a namespace that never mounts costs a broken click instead of
 * an inactive plugin entry.
 */
const UI_SERVICES = ['remote', 'workspaces', 'slots', 'locale'];
/**
 * Open the OS directory chooser.
 *
 * The desktop renderer exposes `__DSH_DIRECTORY_PICKER__` (the built-in native
 * picker uses it first); otherwise the injected `workspaces` service answers.
 * Both are resolved at call time, never at registration.
 */
function pickDirectory(ctx) {
    const bridge = globalThis.__DSH_DIRECTORY_PICKER__;
    if (bridge !== undefined && typeof bridge.pick === 'function')
        return bridge.pick();
    const workspaces = ctx.workspaces;
    if (typeof workspaces?.pickDirectory === 'function')
        return workspaces.pickDirectory();
    console.error('[multi-workspace] no directory picker available');
    return Promise.resolve(null);
}
/**
 * Scoped context that injected `remote.multiWorkspace`. cordis refuses to read a
 * `remote.<namespace>` property from a context that did not inject it, so the
 * calls go through the context the injection callback hands us.
 */
let namespaceCtx;
/** Read the namespace, or explain that it has not mounted yet. */
function remoteNamespace() {
    if (namespaceCtx === undefined)
        throw new Error('multi-workspace: the Remote namespace is not ready yet');
    return namespaceCtx.remote.multiWorkspace;
}
/** Register the dialog once the services it renders against exist. */
function registerMultiWorkspace(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'multi-workspace: dictionaries');
    const injected = (decorateWorkspaceMenu) => () => ({
        pick: () => pickDirectory(ctx),
        get: async (workspaceId) => {
            const result = await remoteNamespace().get(workspaceId);
            if (!result.ok)
                throw new Error(result.error.message);
            return result.value;
        },
        remove: async (workspaceId) => {
            const result = await remoteNamespace().delete(workspaceId);
            if (!result.ok)
                throw new Error(result.error.message);
        },
        register: async (workspaceId, paths, primaryPath) => {
            const result = await remoteNamespace().register(workspaceId, paths, primaryPath);
            if (!result.ok)
                throw new Error(result.error.message);
        },
        createWorkspace: input => ctx.workspaces.create(input),
        renameWorkspace: async (workspaceId, title) => { await ctx.workspaces.rename(workspaceId, title); },
        deleteWorkspace: async (workspaceId) => { await ctx.workspaces.delete(workspaceId); },
        decorateWorkspaceMenu,
    });
    // The built-in single-folder flow registers into both holes at the default
    // priority; a lower number wins a `single` slot, so this component replaces
    // that dialog while the picker provider stays mounted.
    ctx.slots.inject('conversation.hero.workspace.directoryFlow', () => ctx.slots.inject('sidebar.workspaces.directoryFlow', function* () {
        yield ctx.slots.register({ name: 'conversation.hero.workspace.directoryFlow', priority: -10, inject: injected(false), locale: NS }, MultiWorkspaceFlow);
        yield ctx.slots.register({ name: 'sidebar.workspaces.directoryFlow', priority: -10, inject: injected(true), locale: NS }, MultiWorkspaceFlow);
    }));
}
/** Required service for mounting the plugin-owned Remote contribution. */
export const inject = ['remote'];
/**
 * Mount the Remote contribution, then register the directory-flow UI.
 *
 * Neither step may block activation: `ctx.inject()` hands back a fiber that
 * stays inactive until every listed service exists, and the desktop boot audit
 * fails the whole entry when one never appears. So the mount is fire-and-forget
 * and the UI subscribes only to services that are certainly present; the
 * `multiWorkspace` namespace is read at call time by the injected callbacks.
 */
export async function apply(ctx) {
    try {
        // The generated contribution and the protocol's descriptor type come from
        // two copies of the protocol package (host vs. app), so the value is sound
        // while the nominally-typed argument is not assignable across them.
        const contribution = multiWorkspaceRemote;
        void ctx.remote.$mount(contribution).catch((error) => {
            console.error('[multi-workspace] remote mount failed', error);
        });
    }
    catch (error) {
        console.error('[multi-workspace] remote mount threw', error);
    }
    // Capture the scoped context that may read `remote.multiWorkspace`. This is a
    // separate, non-blocking injection: the UI must register even when the
    // namespace is late.
    ctx.inject(['remote.multiWorkspace'], (scoped) => {
        namespaceCtx = scoped;
    });
    try {
        ctx.inject(UI_SERVICES, registerMultiWorkspace);
    }
    catch (error) {
        console.error('[multi-workspace] ui registration threw', error);
    }
}
//# sourceMappingURL=index.js.map