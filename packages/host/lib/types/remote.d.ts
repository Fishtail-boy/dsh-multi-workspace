/** Client Remote contribution for multi-project workspace registration. */
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { MultiWorkspaceRecord } from './types.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespaceMap {
        multiWorkspace: {
            register: (workspaceId: string, paths: string[], primaryPath: string) => Promise<RemoteResult<MultiWorkspaceRecord>>;
            get: (workspaceId: string) => Promise<RemoteResult<MultiWorkspaceRecord | null>>;
            delete: (workspaceId: string) => Promise<RemoteResult<boolean>>;
        };
    }
    interface TypertRemoteMap {
        'multiWorkspace/register': (workspaceId: string, paths: string[], primaryPath: string) => Promise<RemoteResult<MultiWorkspaceRecord>>;
        'multiWorkspace/get': (workspaceId: string) => Promise<RemoteResult<MultiWorkspaceRecord | null>>;
        'multiWorkspace/delete': (workspaceId: string) => Promise<RemoteResult<boolean>>;
    }
}
export declare const TYPERT_REMOTE: {
    package: string;
    descriptors: readonly [{
        readonly id: "dsh-multi-workspace-host#multiWorkspace/register";
        readonly service: "multiWorkspace";
        readonly namespace: "multiWorkspace";
        readonly method: "register";
        readonly invocation: {
            readonly kind: "direct";
        };
        readonly parameters: readonly [import("@deepseek-ai/dsh-typert-protocol").InvocationParameterDescriptor, import("@deepseek-ai/dsh-typert-protocol").InvocationParameterDescriptor, import("@deepseek-ai/dsh-typert-protocol").InvocationParameterDescriptor];
        readonly result: {
            readonly mode: "strict";
            readonly typeSymbol: "dsh-multi-workspace-host/types#MultiWorkspaceRecord";
            readonly create: () => import("zod").ZodObject<{
                workspaceId: import("zod").ZodString;
                paths: import("zod").ZodArray<import("zod").ZodString>;
                primaryPath: import("zod").ZodString;
                updatedAt: import("zod").ZodString;
            }, import("zod/v4/core").$strip>;
        };
    }, {
        readonly id: "dsh-multi-workspace-host#multiWorkspace/get";
        readonly service: "multiWorkspace";
        readonly namespace: "multiWorkspace";
        readonly method: "get";
        readonly invocation: {
            readonly kind: "direct";
        };
        readonly parameters: readonly [import("@deepseek-ai/dsh-typert-protocol").InvocationParameterDescriptor];
        readonly result: {
            readonly mode: "strict";
            readonly typeSymbol: "dsh-multi-workspace-host/types#MultiWorkspaceRecord";
            readonly create: () => import("zod").ZodNullable<import("zod").ZodObject<{
                workspaceId: import("zod").ZodString;
                paths: import("zod").ZodArray<import("zod").ZodString>;
                primaryPath: import("zod").ZodString;
                updatedAt: import("zod").ZodString;
            }, import("zod/v4/core").$strip>>;
        };
    }, {
        readonly id: "dsh-multi-workspace-host#multiWorkspace/delete";
        readonly service: "multiWorkspace";
        readonly namespace: "multiWorkspace";
        readonly method: "delete";
        readonly invocation: {
            readonly kind: "direct";
        };
        readonly parameters: readonly [import("@deepseek-ai/dsh-typert-protocol").InvocationParameterDescriptor];
        readonly result: {
            readonly mode: "strict";
            readonly typeSymbol: "dsh-multi-workspace-host#boolean";
            readonly create: () => import("zod").ZodBoolean;
        };
    }];
};
export default TYPERT_REMOTE;
