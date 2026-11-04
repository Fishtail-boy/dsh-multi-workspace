export const zh = {
  createTitle: '创建项目',
  editTitle: '编辑项目',
  editProject: '编辑项目',
  name: '项目名称',
  folders: '源文件夹',
  add: '添加文件夹',
  remove: '移除文件夹',
  empty: '添加 Codex 可读取和编辑的文件夹',
  cancel: '取消',
  create: '创建项目',
  creating: '正在创建…',
  save: '保存更改',
  saving: '正在保存…',
  loading: '正在读取源文件夹…',
  primary: '主要',
  setPrimary: '设为主要',
  removeProject: '移除本地项目',
  error: '无法更新项目',
} satisfies Record<string, string>
export type MultiWorkspaceKey = keyof typeof zh
export const en = {
  createTitle: 'Create project', editTitle: 'Edit project', editProject: 'Edit project', name: 'Project name',
  folders: 'Source folders', add: 'Add folder', remove: 'Remove folder',
  empty: 'Add folders Codex can read and edit', cancel: 'Cancel', create: 'Create project', creating: 'Creating…',
  save: 'Save changes', saving: 'Saving…', loading: 'Loading source folders…', primary: 'Primary',
  setPrimary: 'Set as primary', removeProject: 'Remove local project', error: 'Could not update project',
} satisfies Record<MultiWorkspaceKey, string>
