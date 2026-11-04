# Changes in this fork

Upstream: [zhanghd/dsh-multi-workspace](https://github.com/zhanghd/dsh-multi-workspace)

Upstream ships source only, as a slice of the DeepSeek Harness monorepo
(`workspace:^` dependencies, `tsconfig` extending `../../../../tsconfig.base.json`,
client bundle built by the in-repo `packages/client/tsdown.client.ts`). It cannot
be installed from git — DSH's own docs note that a git install fetches sources and
never runs a build — and it was written against a different DSH API generation.

This fork keeps the plugin behaviour identical and makes it build and run on
DSH **0.2.1-rc.5**.

## 1. Typert remote codec: `schema` → `create`

`packages/host/src/remote-contract.ts`

0.2.1-rc.5's `TypertRemoteValue` is `{ create: () => TypertSchema<Value> }`; the
runtime calls `codec.create()` while registering a remote. Upstream passed a
`schema` property, so registration threw. Every codec now uses
`create: () => schema`.

## 2. Message source kind

`packages/host/src/index.ts`

Upstream injected model context with `source: { kind: 'plugin', plugin: ... }`.
`MessageSourceMap` in 0.2.1-rc.5 is a merge-extensible sum type with no shared
`plugin` catch-all, so the kind is now the plugin's own (`'multi-workspace'`)
declared through a module augmentation, with the same `form: 'snapshot'`
sections.

## 3. Client icons

`packages/client/src/client/MultiWorkspaceFlow.tsx`

`IconCloseOutline16` / `IconFolderClose16` / `IconPlusOutline16` do not exist in
`@deepseek-ai/dsh-client-ui-primitives@0.2.1-rc.5`; the same artwork ships as
`IconCloseOutlineRegular` / `IconFolderCloseRegular` / `IconPlusOutlineRegular`.

## 4. Client bundle config

`packages/client/tsdown.config.ts`

`clientBundle()` takes the package **directory** (`import.meta.dirname`), not the
package name.

## 5. Standalone build

- `tsconfig.base.json` / `tsconfig.base.client.json` are local, with no
  monorepo `paths` mapping and no project references.
- The DSH client bundle preset is vendored under `vendor/dsh-build/` (MIT,
  build-time only — see its README).
- `@deepseek-ai/*` dependencies are pinned to published npm versions.
- `lib/` and `lib/types/` are committed, so installing needs no build step.

## 6. Renamed

The fork no longer shares upstream's package names, so both can be installed
side by side and nothing resolves to a scope we do not own:

| upstream | this fork |
| --- | --- |
| `@skylarking/dsh-multi-workspace` | `dsh-multi-workspace` |
| `@skylarking/dsh-client-ui-multi-workspace` | `dsh-multi-workspace-client` |
| `@skylarking/dsh-host-multi-workspace` | `dsh-multi-workspace-host` |

Typert invocation ids, `typeSymbol`s and the client bundle id follow the new
names.

## 7. One implicit `any`

`packages/client/src/client/MultiWorkspaceFlow.tsx` — the `useWorkspaces`
selector parameter is annotated, so `tsc` exits clean instead of emitting under
`noImplicitAny`.