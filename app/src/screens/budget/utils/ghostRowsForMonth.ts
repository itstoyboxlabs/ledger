import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'
import type { Transaction } from '@/shared/types/Transaction'
import type { GhostRow } from '@/screens/budget/types/GhostRow'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { monthOf } from '@/shared/utils/monthOf'
import { spendAmount } from '@/shared/utils/spendAmount'
import { rowMatch } from '@/shared/utils/rowMatch'
import { txnMatches } from '@/shared/utils/txnMatches'

// Everything you actually spent in a month that NO budget row claims, grouped by
// category · subcategory. These render as read-only "ghost" rows under the real
// ones so the Actual column adds up to every dollar that left the accounts —
// otherwise "how much did I actually spend" quietly omits whatever you never
// thought to budget for.
export function ghostRowsForMonth(month: string, budgetRows: BudgetRowLike[]): GhostRow[] {
  const groups = new Map<string, { amount: number; txns: Transaction[] }>()
  for (const t of getAllTxns()) {
    if (monthOf(t) !== month) continue
    const amt = spendAmount(t)
    if (!amt) continue
    if (budgetRows.some((r) => txnMatches(t, rowMatch(r)))) continue
    const key = `${t.cat} · ${t.sub}`
    const g = groups.get(key) ?? { amount: 0, txns: [] }
    g.amount += amt
    g.txns.push(t)
    groups.set(key, g)
  }
  return [...groups]
    .filter(([, g]) => Math.round(g.amount) !== 0)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([name, g]) => ({
      id: `ghost-${name}`,
      name,
      amount: g.amount,
      // biggest charge first — "what made this up" is answered by the top line
      txns: [...g.txns].sort((a, b) => Math.abs(spendAmount(b)) - Math.abs(spendAmount(a))),
      __ghost: true as const,
    }))
}
