import type { MonthlyRow } from '@/screens/spending/types/MonthlyRow'
import type { Transaction } from '@/shared/types/Transaction'
import { spendAmount } from '@/shared/utils/spendAmount'

type Sparks = { spend: number[]; income: number[]; net: number[] }

// The KPI sparklines. For one month: running totals day by day through it. For more: one point
// per month in scope.
export function kpiSparks(scopeMonths: string[], monthly: MonthlyRow[], scoped: Transaction[]): Sparks {
  if (scopeMonths.length !== 1) {
    const rows = monthly.filter((r) => scopeMonths.includes(r.m))
    return {
      spend: rows.map((r) => r.spending),
      income: rows.map((r) => r.income),
      net: rows.map((r) => r.net),
    }
  }
  const [y, mo] = (scopeMonths[0] ?? '').split('-').map(Number)
  const days = new Date(y, mo, 0).getDate()
  const spend = Array(days).fill(0)
  const inc = Array(days).fill(0)
  for (const t of scoped) {
    const d = Number(t.date.slice(8, 10)) - 1
    if (t.kind === 'income') inc[d] += t.amount
    else if (t.kind === 'expense' || t.kind === 'refund') spend[d] += spendAmount(t)
  }
  const run = (arr: number[]) => {
    let acc = 0
    return arr.map((v) => (acc += v))
  }
  const rs = run(spend)
  const ri = run(inc)
  return { spend: rs, income: ri, net: ri.map((v, i) => v - rs[i]) }
}
