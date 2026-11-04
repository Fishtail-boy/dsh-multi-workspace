import multiWorkspaceRemote from 'dsh-multi-workspace-host/remote';
import { MultiWorkspaceFlow } from "./MultiWorkspaceFlow.js";
import { en, zh } from "./locales.js";
const NS = 'multi-workspace';
const UI_INJECT = ['remote', 'remote.multiWorkspace', 'workspaces', 'slots', 'locale'];
/** Register the dialog only after its mounted Remote namespace is injectable. */
function registerMultiWorkspace(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'multi-workspace: dictionaries');
    const injected = (decorateWorkspaceMenu) => () => ({
        pick: () => ctx.workspaces.pickDirectory(),
        get: async (workspaceId) => {
            const result = await ctx.remote.multiWorkspace.get(workspaceId);
            if (!result.ok)
                throw new Error(result.error.message);
            return result.value;
        },
        remove: async (workspaceId) => {
            const result = await ctx.remote.multiWorkspace.delete(workspaceId);
            if (!result.ok)
                throw new Error(result.error.message);
        },
        register: async (workspaceId, paths, primaryPath) => {
            const result = await ctx.remote.multiWorkspace.register(workspaceId, paths, primaryPath);
            if (!result.ok)
                throw new Error(result.error.message);
        },
        createWorkspace: input => ctx.workspaces.create(input),
        renameWorkspace: async (workspaceId, title) => { await ctx.workspaces.rename(workspaceId, title); },
        deleteWorkspace: async (workspaceId) => { await ctx.workspaces.delete(workspaceId); },
        decorateWorkspaceMenu,
    });
    ctx.slots.inject('conversation.hero.workspace.directoryFlow', () => ctx.slots.inject('sidebar.workspaces.directoryFlow', function* () {
        yield ctx.slots.register({ name: 'conversation.hero.workspace.directoryFlow', priority: -10, inject: injected(false), locale: NS }, MultiWorkspaceFlow);
        yield ctx.slots.register({ name: 'sidebar.workspaces.directoryFlow', priority: -10, inject: injected(true), locale: NS }, MultiWorkspaceFlow);
    }));
}
/** Required service for mounting the plugin-owned Remote contribution. */
export const inject = ['remote'];
/** Mount the Remote contribution before starting its UI consumer. */
export async function apply(ctx) {
    await ctx.remote.$mount(multiWorkspaceRemote);
    await ctx.inject(UI_INJECT, registerMultiWorkspace);
}
//# sourceMappingURL=index.js.map