/** Client Remote contribution for multi-project workspace registration. */
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import type { MultiWorkspaceRecord } from './types.ts'
import { MULTI_WORKSPACE_INVOCATIONS } from './remote-contract.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespaceMap {
    multiWorkspace: {
      register: (workspaceId: string, paths: string[], primaryPath: string) => Promise<RemoteResult<MultiWorkspaceRecord>>
      get: (workspaceId: string) => Promise<RemoteResult<MultiWorkspaceRecord | null>>
      delete: (workspaceId: string) => Promise<RemoteResult<boolean>>
    }
  }
  interface TypertRemoteMap {
    'multiWorkspace/register': (workspaceId: string, paths: string[], primaryPath: string) => Promise<RemoteResult<MultiWorkspaceRecord>>
    'multiWorkspace/get': (workspaceId: string) => Promise<RemoteResult<MultiWorkspaceRecord | null>>
    'multiWorkspace/delete': (workspaceId: string) => Promise<RemoteResult<boolean>>
  }
}

export const TYPERT_REMOTE = {
  package: 'dsh-multi-workspace-host', descriptors: MULTI_WORKSPACE_INVOCATIONS,
} satisfies TypertRemoteContribution
export default TYPERT_REMOTE
