# Vendored build preset

These files are copied verbatim from the DeepSeek Harness source tree:

- repository: https://github.com/deepseek-ai/deepseek-harness
- tag: `dsh-v0.2.1-rc.5`
- license: MIT (see ../../LICENSE for this repository's license)

Files:

| file | upstream path |
| --- | --- |
| `packages/client/tsdown.client.ts` | `packages/client/tsdown.client.ts` |
| `packages/client/modules/src/client/manifest.ts` | same |
| `packages/client/web/src/platform.ts` | same |
| `scripts/client-build-environment.ts` | same |
| `scripts/experimental-package-policy.ts` | same |
| `scripts/bundle-input-isolation.ts` | same |

They are **build-time only**: they emit the DSH client bundle contract
(`window.__ModuleLoader__.load({ id, factory })`, module-table externals, CSS
modules compiled by lightningcss). Nothing here ships to users at runtime.

The directory depth is preserved so the preset's relative imports
(`./modules/...`, `./web/...`, `../../scripts/...`) resolve unchanged.
