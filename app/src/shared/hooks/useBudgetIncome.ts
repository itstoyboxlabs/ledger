import { STATES } from '@/shared/constants/STATES'
import { DEFAULT_STATE } from '@/shared/constants/DEFAULT_STATE'
import { TAKE_HOME_DEFAULTS } from '@/shared/constants/TAKE_HOME_DEFAULTS'
import { budgetIncomeFor } from '@/shared/utils/budgetIncomeFor'
import { useIncomeOverride } from '@/shared/hooks/useIncomeOverride'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { useToolState } from '@/shared/hooks/useToolState'
import type { TakeHome } from '@/shared/types/TakeHome'

// The monthly income every tool should plan against, whichever source the Budget page
// is on. Single source so Rent scenarios, Vacation, Debt payoff and Retirement can't
// disagree with Budget.
export function useBudgetIncome(): number {
  const [taxState] = usePersistedState<string>('taxState', DEFAULT_STATE, (v) => typeof v === 'string' && v in STATES)
  const [ov] = useIncomeOverride()
  const [th] = useToolState<TakeHome>('takeHome', TAKE_HOME_DEFAULTS)
  return budgetIncomeFor(ov, th, taxState)
}
