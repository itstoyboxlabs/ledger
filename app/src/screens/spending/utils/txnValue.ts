import type { Transaction } from '@/shared/types/Transaction'
import { spendAmount } from '@/shared/utils/spendAmount'

// display value: spending positive, refunds negative (green), income positive (green)
export function txnValue(t: Pick<Transaction, 'kind' | 'amount'>): number {
  return t.kind === 'income' ? t.amount : spendAmount(t)
}
