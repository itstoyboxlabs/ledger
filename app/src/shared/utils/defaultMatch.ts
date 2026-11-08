import { matchIndex } from '@/shared/utils/matchIndex'
import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'
import type { RowMatch } from '@/shared/types/RowMatch'

// `match` says which transactions count toward a row's Actual:
//   { merchant } | { merchants: [...] } | { cat, sub? } | { merchants?, cats: [{ cat, sub? }] } | null
// null means "no match" (Actual shows a dash). When a row has no `match` at all, the
// default is: a subscription matches its own merchant; else the row name equals a
// merchant, then a category, then a subcategory; else nothing.
export function defaultMatch(row: BudgetRowLike): RowMatch | null {
  const name = row.name
  if (row.source === 'subscription') return { merchant: name }
  const idx = matchIndex()
  if (idx.merchants.has(name)) return { merchant: name }
  if (idx.cats.has(name)) return { cat: name }
  for (const [cat, subs] of idx.cats) if (subs.has(name)) return { cat, sub: name }
  return null
}
