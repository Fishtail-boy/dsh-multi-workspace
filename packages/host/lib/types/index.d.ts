import { Context, Service } from '@deepseek-ai/cordis';
import { type ContextFormed } from '@deepseek-ai/dsh-llm';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { MultiWorkspaceRecord } from './types.ts';
export type * from './types.ts';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'multi-workspace': {
            readonly kind: 'multi-workspace';
        } & ContextFormed;
    }
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        multiWorkspaceRegistry: MultiWorkspaceRegistry;
    }
}
/** Durable registry for the extra folders attached to one native workspace. */
export declare class MultiWorkspaceRegistry extends Service {
    static inject: string[];
    private records;
    constructor(ctx: Context);
    private get workspaceRegistry();
    private get sandboxPolicy();
    private persist;
    private load;
    private normalizeDirectory;
    register(workspaceId: string, paths: string[], primaryPath: string): Promise<MultiWorkspaceRecord>;
    /**
     * Point the native workspace at the chosen primary folder.
     *
     * The workspace registry renamed this operation across DSH releases, and a
     * missing setter must not fail the save: the extra-folder mapping and the
     * model context are the parts that matter, so an unsettable path degrades to
     * "the native root stays the primary folder".
     */
    private setWorkspacePath;
    remove(workspaceId: string): Promise<boolean>;
    get(workspaceId: string): MultiWorkspaceRecord | null;
    private recordForSession;
    private additionalWritableRoots;
    private injectContext;
    installPrompt(): void;
}
/** Remote gateway exposed to the browser half. */
export declare class MultiWorkspaceGateway extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    register(workspaceId: string, paths: string[], primaryPath: string): Promise<MultiWorkspaceRecord>;
    get(workspaceId: string): Promise<MultiWorkspaceRecord | null>;
    delete(workspaceId: string): Promise<boolean>;
}
export declare const inject: string[];
export declare function apply(ctx: Context): void;
export default apply;
