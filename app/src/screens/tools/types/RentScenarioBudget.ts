import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { RentScenarioExpense } from '@/screens/tools/types/RentScenarioExpense'

// What the rent scenario table reads from the Budget tab.
export interface RentScenarioBudget {
  currentRent: number
  allRows: BudgetRow[]
  rows: RentScenarioExpense[]
}
