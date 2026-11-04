# Multi-project workspace loading and maintenance

Status: implemented

## Problem

The installed bundle contributed Host and client Loader rows, but the client package did not export `./package.json`. The Host client-module registry discovers `dsh.client` packages by resolving that exact subpath, so it cached the package as non-client and omitted it from `window.__DSH_BOOT__`. The Desktop then continued using the built-in single-folder directory flow.

Loading the missing client unchanged would also fail: the adaptive directory picker mounts its own client surface into the same two `single` directory-flow slots. Two occupants are invalid composition.

Users also need to revise the additional folders after a workspace is created. The workspace row menu has no plugin entry slot, and this plugin must not modify the owning `ui-workspace` package. Putting management in a second tab of the create dialog made the create surface wider than its Host modal and hid the expected row-level edit action.

## Decision

The bundle disables the `directory-picker` auto row, inserts the existing native Host provider under a plugin-owned id, then inserts its own Host registry and client surface. Folder picking still uses the maintained Host capability, while exactly one client owns both directory-flow slots.

The client and Host support packages export `./package.json`; this makes discovery explicit and matches the repository's other out-of-tree client packages. The Host package also exports a `./typert` artifact carrying the same invocation descriptors as the client Remote contribution, so the Typert Loader can register `/api/multiWorkspace/*` routes for the Loader row.

The mapping deletion route uses `multiWorkspace/delete`. `remove` is inherited by the Client Remote namespace service and therefore cannot be installed as a Remote method.

The directory-flow dialog only creates projects. Its responsive width, project-name input, source-folder panel, and footer follow the existing create-project surface and keep all content inside the viewport. The first folder remains the native root, while any selected folder can become the primary project before creation.

The sidebar directory-flow occupant is mounted for the lifetime of the workspace browser. It uses the Host row and menu ARIA roles to identify a workspace ellipsis click, then inserts an **Edit project** row between the Host-owned rename and delete rows. Selecting it closes the Host menu and opens the plugin editor. This adapter is intentionally isolated in one hook and can be replaced by a menu-item slot when `ui-workspace` publishes one.

The editor persists source folders under the immutable native root key. It can select a different `primaryPath` for model context, while the native root always remains registered because workspace sessions retain that cwd. Non-primary rows reveal this action on hover or keyboard focus; touch input keeps the action visible. A root-only list remains a normal one-folder workspace. Saving never modifies selected directory contents.

## Verification

- The registry test covers normalization, deduplication, primary-folder persistence, reload, native-root retention, and removal down to the root-only state.
- Package builds prove both Host and browser bundles resolve under the split TypeScript programs.
- Client interaction tests cover the create-only dialog, menu-row adapter, source-folder editing, primary selection, rename, and save.
- A clean-profile browser smoke checks that the create dialog fits the viewport and that the real workspace ellipsis menu opens the editor with the persisted project name and source-folder rows.
