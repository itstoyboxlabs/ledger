// The age the planning pages use. `on` is the day it is measured on: the Balances "as of" date
// (`source: 'balances'`) or today when Balances has no date (`'today'`). An old save with only a
// typed age and no birth date reads as that fixed age (`'saved'`, `on` is null).
export interface PlanningAge {
  age: number
  source: 'balances' | 'today' | 'saved'
  on: string | null
}
