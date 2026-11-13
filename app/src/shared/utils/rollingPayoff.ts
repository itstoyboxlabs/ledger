import type { Debt } from '@/shared/types/Debt'
import type { RollingPayoff } from '@/shared/types/RollingPayoff'

const MAX_MONTHS = 1200

// Pays several debts off together, in the order given (the priority order on Balances).
// `monthly` is all the money that goes toward them each month. Every debt gets its own
// payment first, then what is left goes to the first debt still owing, and when a debt clears
// its payment rolls on to the next one. Interest builds monthly at each debt's APR.
// `months[i]` is the month debt i clears (0 when nothing is owed, null when it never does).
// `spent` is what went to the debts each month. `total` is when the last one clears, or null when any never does (past 100 years).
export function rollingPayoff(debts: Pick<Debt, 'balance' | 'apr' | 'payment'>[], monthly: number): RollingPayoff {
  const left = debts.map((d) => Math.max(0, Number(d.balance) || 0))
  const months: (number | null)[] = left.map((b) => (b > 0.005 ? null : 0))
  const pool = Math.max(0, monthly)
  const spent: number[] = []
  for (let m = 1; m <= MAX_MONTHS && months.some((x) => x === null); m++) {
    let avail = pool
    const open = debts.map((_, i) => i).filter((i) => months[i] === null)
    for (const i of open) left[i] += (left[i] * (Number(debts[i].apr) || 0)) / 1200
    for (const i of open) {
      const pay = Math.min(Math.max(0, Number(debts[i].payment) || 0), left[i], avail)
      left[i] -= pay
      avail -= pay
    }
    for (const i of open) {
      const pay = Math.min(avail, left[i])
      left[i] -= pay
      avail -= pay
    }
    for (const i of open) if (left[i] <= 0.005) months[i] = m
    spent.push(pool - avail)
  }
  return { months, total: months.some((x) => x === null) ? null : Math.max(0, ...(months as number[])), spent }
}
