import { isActiveSubscription } from '@/shared/utils/isActiveSubscription'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'

// budget rows with source "subscription" are auto-hidden when their matching
// statement subscription (by name) stopped charging. Rows with no statement
// match (billed to an account that isn't in the statements) can't be judged: always shown.
export function isBudgetRowHidden(row: BudgetRowLike): boolean {
  if (row.source !== 'subscription') return false
  const sub = getSubscriptions().find((s) => s.name === row.name)
  if (!sub) return false
  return !isActiveSubscription(sub)
}
