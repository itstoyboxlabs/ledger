import { FilingStatus } from '@/shared/enums/FilingStatus'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { isFilingStatus } from '@/shared/utils/isFilingStatus'

// The filing status set on the About you page (`ledger:filingStatus`). Nothing saved, or a
// value the app does not know, reads as single, which is how every number worked before.
export function useFilingStatus() {
  return usePersistedState<FilingStatus>('filingStatus', FilingStatus.single, isFilingStatus)
}
