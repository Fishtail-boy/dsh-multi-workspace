import { z } from 'zod';
export declare const MULTI_WORKSPACE_INVOCATIONS: readonly [{
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
        readonly create: () => z.ZodObject<{
            workspaceId: z.ZodString;
            paths: z.ZodArray<z.ZodString>;
            primaryPath: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>;
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
        readonly create: () => z.ZodNullable<z.ZodObject<{
            workspaceId: z.ZodString;
            paths: z.ZodArray<z.ZodString>;
            primaryPath: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
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
        readonly create: () => z.ZodBoolean;
    };
}];
