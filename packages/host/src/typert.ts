/** Host Typert contribution owned by the multi-workspace plugin. */

import { MULTI_WORKSPACE_INVOCATIONS } from './remote-contract.ts'

/** Runtime contribution loaded from the package's `./typert` export. */
export const TYPERT = {
  package: 'dsh-multi-workspace-host',
  face: 'host',
  schemas: [],
  invocations: MULTI_WORKSPACE_INVOCATIONS,
  model: { services: [], events: [], objects: [] },
} as const
