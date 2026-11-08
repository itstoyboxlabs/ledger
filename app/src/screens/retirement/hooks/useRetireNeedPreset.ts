import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { NEED_PRESET_KEY } from '@/screens/retirement/constants/NEED_PRESET_KEY'

// The Budget preset name "Need per month" follows, or null to use the typed number.
// Nothing stored (every save from before this existed) or anything that is not a
// non-empty string reads as null, so those plans behave exactly as before.
export function useRetireNeedPreset() {
  return usePersistedState<string | null>(NEED_PRESET_KEY, null, (v) => v === null || (typeof v === 'string' && v !== ''))
}
