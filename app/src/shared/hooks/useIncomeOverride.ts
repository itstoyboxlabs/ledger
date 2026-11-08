import { INCOME_OVERRIDE_DEFAULTS } from '@/shared/constants/INCOME_OVERRIDE_DEFAULTS'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import type { IncomeOverride } from '@/shared/types/IncomeOverride'
import { isObj } from '@/shared/utils/isObj'

export function useIncomeOverride() {
  return usePersistedState<IncomeOverride>(
    'budgetIncomeOverride', INCOME_OVERRIDE_DEFAULTS,
    isObj,
  )
}
