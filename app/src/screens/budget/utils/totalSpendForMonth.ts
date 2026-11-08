import { getAllTxns } from '@/shared/utils/getAllTxns'
import { monthOf } from '@/shared/utils/monthOf'
import { spendAmount } from '@/shared/utils/spendAmount'

// total real spend in a month — the number the Actual column's grand total must
// equal once ghost rows are included
export function totalSpendForMonth(month: string): number {
  return getAllTxns().filter((t) => monthOf(t) === month).reduce((s, t) => s + spendAmount(t), 0)
}
