import type { BudgetSort } from '@/screens/budget/types/BudgetSort'

// A saved Budget sort is usable when its column is one the table has and its direction is valid.
export function isBudgetSort(v: unknown): v is BudgetSort {
  const s = v as BudgetSort | null
  return !!s && [null, 'name', 'amount', 'actual', 'diff'].includes(s.key) && (s.dir === 'asc' || s.dir === 'desc')
}
