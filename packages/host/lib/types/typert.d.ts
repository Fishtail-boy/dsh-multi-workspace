/** Host Typert contribution owned by the multi-workspace plugin. */
/** Runtime contribution loaded from the package's `./typert` export. */
export declare const TYPERT: {
    readonly package: "dsh-multi-workspace-host";
    readonly face: "host";
    readonly schemas: readonly [];
    readonly invocations: readonly [{
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
    readonly model: {
        readonly services: readonly [];
        readonly events: readonly [];
        readonly objects: readonly [];
    };
};
