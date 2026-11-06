/** Client registration for the multi-project directory flow. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type MultiWorkspaceKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'multi-workspace': MultiWorkspaceKey;
    }
}
/** Required service for mounting the plugin-owned Remote contribution. */
export declare const inject: string[];
/**
 * Mount the Remote contribution, then register the directory-flow UI.
 *
 * Neither step may block activation: `ctx.inject()` hands back a fiber that
 * stays inactive until every listed service exists, and the desktop boot audit
 * fails the whole entry when one never appears. So the mount is fire-and-forget
 * and the UI subscribes only to services that are certainly present; the
 * `multiWorkspace` namespace is read at call time by the injected callbacks.
 */
export declare function apply(ctx: ClientContext): Promise<void>;
