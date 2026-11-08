import { getAllTxns } from '@/shared/utils/getAllTxns'
import { monthOf } from '@/shared/utils/monthOf'
import { spendAmount } from '@/shared/utils/spendAmount'
import { rowMatch } from '@/shared/utils/rowMatch'
import { txnMatches } from '@/shared/utils/txnMatches'
import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'

// actual amount spent against one budget row, for one calendar month, or null if the
// row counts nothing toward Actual
export function actualForBudgetRow(row: BudgetRowLike, month: string | undefined): number | null {
  const m = rowMatch(row)
  if (!m) return null
  return getAllTxns().filter((t) => monthOf(t) === month && txnMatches(t, m)).reduce((s, t) => s + spendAmount(t), 0)
}
