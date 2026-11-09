import type { Debt } from '@/shared/types/Debt'

// The interest rate of several debts together: each APR weighted by its balance, so a big
// loan counts for more than a small card. 0 when nothing is owed.
export function weightedApr(debts: Pick<Debt, 'apr' | 'balance'>[]): number {
  const total = debts.reduce((s, d) => s + d.balance, 0)
  return total > 0 ? debts.reduce((s, d) => s + (Number(d.apr) || 0) * d.balance, 0) / total : 0
}
