/** Wire-safe multi-project workspace records. */
export interface MultiWorkspaceRecord {
  workspaceId: string
  paths: string[]
  primaryPath: string
  updatedAt: string
}
