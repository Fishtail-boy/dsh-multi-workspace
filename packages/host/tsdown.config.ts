import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'lib/types/index.js',
    remote: 'lib/types/remote.js',
    'typert.host': 'lib/types/typert.js',
    types: 'lib/types/types.js',
  },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  // zod is bundled: the package is installed by link into a profile, where a
  // linked package's own dependencies are never installed.
  noExternal: ['zod'],
})