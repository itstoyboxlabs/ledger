import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { STATES } from '@/shared/constants/STATES'
import { usePersistedState } from '@/shared/hooks/usePersistedState'

// The tax state set on the About you page (`ledger:taxState`). Nothing saved, or a state the app
// has no tables for, reads as the default state.
export function useTaxState() {
  return usePersistedState<string>('taxState', DEFAULT_STATE, (v) => typeof v === 'string' && v in STATES)
}
