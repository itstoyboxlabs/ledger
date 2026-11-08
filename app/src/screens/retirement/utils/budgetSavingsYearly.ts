import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import { budgetExpensesOf } from '@/shared/utils/budgetExpensesOf'
import { leftoverAmount } from '@/shared/utils/leftoverAmount'
import { leftoverShare } from '@/shared/utils/leftoverShare'
import { normalizeLeftover } from '@/shared/utils/normalizeLeftover'

// What a Budget saves a year, by the same rules as Auto savings: income less the counted
// rows is the leftover (never below zero). With no allocation on the Budget all of it is
// saved, otherwise only its savings share. `rows` can be a preset's rows; the allocation
// and dismissed subscriptions come from the Budget itself.
export function budgetSavingsYearly(budget: Pick<BudgetFile, 'leftover' | 'dismissedSubs'>, rows: BudgetRow[], monthlyIncome: number): number {
  const leftover = leftoverAmount(monthlyIncome, budgetExpensesOf({ rows, dismissedSubs: budget.dismissedSubs }))
  const alloc = normalizeLeftover(budget.leftover)
  return (alloc.length > 0 ? leftoverShare(alloc, 'savings', leftover) : leftover) * 12
}
