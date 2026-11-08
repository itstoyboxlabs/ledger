import { ageOn } from '@/shared/utils/ageOn'
import { isIsoDate } from '@/shared/utils/isIsoDate'
import type { PlanningAge } from '@/shared/types/PlanningAge'

type PlanningAgeInput = {
  birthDate: string | null
  savedAge: number | null
  balancesAsOf: string | null
  today: string
}

// Your age for planning. With a birth date it is your age on the day Balances was last updated,
// because the balances the plan starts from are only as fresh as that day, so the plan does not
// drift between updates. With no Balances date it is your age today. An old typed age with no
// birth date is used as it is. Null when there is neither.
export function planningAge({ birthDate, savedAge, balancesAsOf, today }: PlanningAgeInput): PlanningAge | null {
  if (birthDate && isIsoDate(birthDate)) {
    const fromBalances = isIsoDate(balancesAsOf)
    const on = fromBalances ? (balancesAsOf as string) : today
    return { age: ageOn(birthDate, on), source: fromBalances ? 'balances' : 'today', on }
  }
  if (savedAge != null) return { age: savedAge, source: 'saved', on: null }
  return null
}
