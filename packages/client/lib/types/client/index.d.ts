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
/** Mount the Remote contribution before starting its UI consumer. */
export declare function apply(ctx: ClientContext): Promise<void>;
