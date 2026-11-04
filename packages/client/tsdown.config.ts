import { clientBundle } from '../../vendor/dsh-build/packages/client/tsdown.client.ts'

export default clientBundle(import.meta.dirname, ['lib/types/index.js'])
