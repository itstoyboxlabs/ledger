import type { BudgetRow } from '@/shared/types/BudgetRow'

// A row as the Budget page shows it: subscriptions carry their live amount, and `__unsaved` marks a subscription
// that exists only in the statements, with no row in the budget file.
export interface EffectiveBudgetRow extends BudgetRow {
  __unsaved?: boolean
}
