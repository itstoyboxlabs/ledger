import { getStorageMode } from '@/shared/utils/getStorageMode'
import { storageModeStore } from '@/shared/state/storageModeStore'

// ask the dev server for the budget. JSON back means local mode. Anything else
// (404, the SPA fallback page, a network error) means browser mode.
export async function detectMode() {
  try {
    const r = await fetch('/api/budget', { headers: { accept: 'application/json' } })
    if (r.ok) {
      await r.json()
      storageModeStore.setState({ mode: 'local' })
    }
  } catch {
    storageModeStore.setState({ mode: 'browser' })
  }
  if (getStorageMode() === 'browser') {
    try {
      navigator.storage?.persist?.()
    } catch { /* not supported */ }
  }
  return getStorageMode()
}
