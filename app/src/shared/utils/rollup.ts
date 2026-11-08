import { spendAmount } from '@/shared/utils/spendAmount'
import type { Transaction } from '@/shared/types/Transaction'
import type { RollupGroup } from '@/shared/types/RollupGroup'

// group transactions by a key fn -> [{name, total, count, txns}] sorted by total desc
export function rollup(txns: Transaction[], keyFn: (t: Transaction) => string): RollupGroup[] {
  const map = new Map<string, RollupGroup>()
  for (const t of txns) {
    const k = keyFn(t)
    if (!map.has(k)) map.set(k, { name: k, total: 0, count: 0, txns: [] })
    const g = map.get(k) as RollupGroup
    g.total += spendAmount(t)
    g.count += 1
    g.txns.push(t)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
