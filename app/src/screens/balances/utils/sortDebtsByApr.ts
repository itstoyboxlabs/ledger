import type { Debt } from '@/shared/types/Debt'

// The debts with the highest APR first, the order that costs the least interest. Debts with the
// same rate keep the order they had.
export function sortDebtsByApr(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => (Number(b.apr) || 0) - (Number(a.apr) || 0))
}
