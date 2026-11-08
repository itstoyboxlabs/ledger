import { useBirthDate } from '@/shared/hooks/useBirthDate'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { planningAge } from '@/shared/utils/planningAge'
import { todayIso } from '@/shared/utils/todayIso'
import type { PlanningAge } from '@/shared/types/PlanningAge'

// The About you age as every planning page should read it: your age on the day Balances was last
// updated (`ledger:assetsAsOf`), today with no such date, or an old fixed age. Null with none.
export function usePlanningAge(): PlanningAge | null {
  const { birthDate, savedAge } = useBirthDate()
  const [asOf] = usePersistedState('assetsAsOf', '', (v) => typeof v === 'string')
  return planningAge({ birthDate, savedAge, balancesAsOf: asOf, today: todayIso() })
}
