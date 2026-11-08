import { persistedStore } from '@/shared/state/persistedStore'
import { applyData } from '@/shared/utils/applyData'
import { idbDelete } from '@/shared/utils/idbDelete'
import { isLocal } from '@/shared/utils/isLocal'
import { LS_PREFIX } from '@/shared/constants/LS_PREFIX'

// Browser mode only: wipes what this browser stores before an upload replaces it. 'settings' removes the
// budget, log, notes, presets and every "ledger:" localStorage key. 'statements' removes the statements
// only. 'all' removes both, and the mark that the sample is loaded.
export async function clearStoredData(scope: 'all' | 'settings' | 'statements'): Promise<void> {
  if (isLocal()) throw new Error('Clearing data is off in local mode. Your data lives in the data folder.')
  const settings = scope !== 'statements'
  const statements = scope !== 'settings'
  const keys = [...(settings ? ['budget', 'log', 'notes', 'presets'] : []), ...(statements ? ['data'] : []), ...(scope === 'all' ? ['sample'] : [])]
  for (const k of keys) await idbDelete(k)
  if (settings) {
    try {
      const stale: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(LS_PREFIX)) stale.push(k)
      }
      for (const k of stale) localStorage.removeItem(k)
    } catch { /* storage unavailable */ }
    persistedStore.setState({ entries: {} })
  }
  if (statements) applyData({})
}
