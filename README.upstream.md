# Multi Workspace

Adds multiple project folders to one workspace. The first selected folder remains the immutable native workspace root; the plugin records every source folder and the selected primary project for model context.

The plugin owns only its additional-folder mapping. Uninstalling it leaves the native workspace and all project files unchanged, while removing the multi-folder UI and model context.

## Use

Open **Add workspace**, choose **Add workspace...**, then use the **Create project** dialog to select a native root and any additional source folders. The optional project name becomes the workspace display title. Hover or focus a non-primary folder row to make it the primary project folder before creation.

Open a workspace row's ellipsis menu and choose **Edit project** to rename it, add or remove source folders, select the primary project folder, or remove the local workspace registration. The primary action appears when a non-primary folder row is hovered or focused. The native workspace root remains in the source-folder set because existing sessions are anchored to that path.

Saving a mapping never creates, removes, or modifies files in any selected folder. Removing the last additional folder leaves the workspace as a normal one-folder workspace.

## Composition

The bundle disables the adaptive directory-picker pair, mounts its native Host provider, and supplies the directory-flow UI itself. This preserves the operating-system folder chooser without composing the built-in single-folder UI into the same single-occupant slots.

The client package must export `./package.json`: the Host client-module registry resolves that subpath to discover `dsh.client` metadata and serve `lib/client.js`.

The mapping deletion RPC is named `delete`; `remove` is reserved by the Client Remote namespace service lifecycle and cannot be mounted as a Remote method.

The workspace row menu does not currently publish a menu-item slot. The plugin therefore attaches its edit action to the Host menu through the row and menu ARIA roles, preserving the Host-owned rename and delete actions without modifying `ui-workspace`.
