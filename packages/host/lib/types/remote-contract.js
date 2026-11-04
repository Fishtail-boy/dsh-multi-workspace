import { z } from 'zod';
const path = z.string().min(1);
const workspaceId = z.string().min(1);
const record = z.object({ workspaceId, paths: z.array(path).min(1), primaryPath: path, updatedAt: z.string() });
function parameter(name, schema) {
    return { name, wire: name, source: 'json', codec: { mode: 'strict', typeSymbol: `dsh-multi-workspace-host#${name}`, create: () => schema } };
}
export const MULTI_WORKSPACE_INVOCATIONS = [
    {
        id: 'dsh-multi-workspace-host#multiWorkspace/register', service: 'multiWorkspace', namespace: 'multiWorkspace', method: 'register', invocation: { kind: 'direct' },
        parameters: [parameter('workspaceId', workspaceId), parameter('paths', z.array(path).min(1)), parameter('primaryPath', path)], result: { mode: 'strict', typeSymbol: 'dsh-multi-workspace-host/types#MultiWorkspaceRecord', create: () => record },
    },
    {
        id: 'dsh-multi-workspace-host#multiWorkspace/get', service: 'multiWorkspace', namespace: 'multiWorkspace', method: 'get', invocation: { kind: 'direct' },
        parameters: [parameter('workspaceId', workspaceId)], result: { mode: 'strict', typeSymbol: 'dsh-multi-workspace-host/types#MultiWorkspaceRecord', create: () => record.nullable() },
    },
    {
        id: 'dsh-multi-workspace-host#multiWorkspace/delete', service: 'multiWorkspace', namespace: 'multiWorkspace', method: 'delete', invocation: { kind: 'direct' },
        parameters: [parameter('workspaceId', workspaceId)], result: { mode: 'strict', typeSymbol: 'dsh-multi-workspace-host#boolean', create: () => z.boolean() },
    },
];
//# sourceMappingURL=remote-contract.js.map