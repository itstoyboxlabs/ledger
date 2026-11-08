import type { Transaction } from '@/shared/types/Transaction'
// signed contribution to spending: expenses add, refunds subtract
export function spendAmount(t: Pick<Transaction, 'kind' | 'amount'>): number {
  if (t.kind === 'expense') return t.amount
  if (t.kind === 'refund') return -t.amount
  return 0
}
