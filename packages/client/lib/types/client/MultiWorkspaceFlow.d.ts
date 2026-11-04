import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client';
import type { MultiWorkspaceRecord } from 'dsh-multi-workspace-host/types';
import type { MultiWorkspaceKey } from './locales.ts';
type Translate = (key: MultiWorkspaceKey) => string;
export interface MultiWorkspaceInjected {
    pick: () => Promise<string | null>;
    get: (workspaceId: WorkspaceId) => Promise<MultiWorkspaceRecord | null>;
    remove: (workspaceId: WorkspaceId) => Promise<void>;
    register: (workspaceId: WorkspaceId, paths: string[], primaryPath: string) => Promise<void>;
    createWorkspace: (input: {
        path: string;
    }) => Promise<WorkspaceView>;
    renameWorkspace: (workspaceId: WorkspaceId, title: string) => Promise<void>;
    deleteWorkspace: (workspaceId: WorkspaceId) => Promise<void>;
    decorateWorkspaceMenu: boolean;
}
type MultiWorkspaceFlowProps = PropsRuntime<'sidebar.workspaces.directoryFlow'> & MultiWorkspaceInjected & {
    t: Translate;
};
/** Create multi-folder projects and edit an existing project from its row menu. */
export declare function MultiWorkspaceFlow(props: MultiWorkspaceFlowProps): import("react").JSX.Element;
export {};
