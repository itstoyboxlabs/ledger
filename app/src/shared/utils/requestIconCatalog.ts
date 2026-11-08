import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { loadIconCatalog } from '@/shared/utils/loadIconCatalog'

// Asks for the logo catalog without getting in the way of the first paint: it loads when the browser is idle
// (or after a short delay where requestIdleCallback is missing). Calling it again before or after is a no-op.
export function requestIconCatalog() {
  if (iconCatalogStore.getState().status !== 'idle') return
  iconCatalogStore.setState({ status: 'queued' })
  const run = () => void loadIconCatalog()
  if (typeof globalThis.requestIdleCallback === 'function') globalThis.requestIdleCallback(run, { timeout: 3000 })
  else setTimeout(run, 300)
}
