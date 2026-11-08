import type { MonthlyRow } from '@/screens/spending/types/MonthlyRow'
import type { Transaction } from '@/shared/types/Transaction'
import { monthOf } from '@/shared/utils/monthOf'
import { spendAmount } from '@/shared/utils/spendAmount'

// One row per month on record, on the switched-on accounts: income, spending, net and spending
// per category under the category's own name. Transfers count in neither.
export function monthlyRows(txns: Transaction[], months: string[], accounts: string[]): MonthlyRow[] {
  return months.map((m) => {
    const row: MonthlyRow = { m, income: 0, spending: 0, net: 0 }
    for (const t of txns) {
      if (monthOf(t) !== m || !accounts.includes(t.account)) continue
      if (t.kind === 'income') row.income += t.amount
      else if (t.kind === 'expense' || t.kind === 'refund') {
        row.spending += spendAmount(t)
        const cat = t.cat ?? ''
        row[cat] = ((row[cat] as number | undefined) ?? 0) + spendAmount(t)
      }
    }
    row.net = row.income - row.spending
    return row
  })
}
