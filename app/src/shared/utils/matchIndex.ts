import { getAllTxns } from '@/shared/utils/getAllTxns'
import type { MatchIndex } from '@/shared/types/MatchIndex'
import type { Transaction } from '@/shared/types/Transaction'

let matchIndexCache: MatchIndex = { merchants: new Set(), cats: new Map() }

// What the transactions contain: merchant names, and categories with their subcategories.
// Rebuilt only when the transactions array itself is replaced.
let matchIndexFor: Transaction[] | null = null

export function matchIndex(): MatchIndex {
  if (matchIndexFor !== getAllTxns()) {
    const merchants = new Set<string>()
    const cats = new Map<string, Set<string>>()
    for (const t of getAllTxns()) {
      if (t.merchant) merchants.add(t.merchant)
      if (t.cat) {
        if (!cats.has(t.cat)) cats.set(t.cat, new Set())
        if (t.sub) cats.get(t.cat)?.add(t.sub)
      }
    }
    matchIndexCache = { merchants, cats }
    matchIndexFor = getAllTxns()
  }
  return matchIndexCache
}
