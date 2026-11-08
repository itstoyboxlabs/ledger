import type { Transaction } from '@/shared/types/Transaction'
import type { RowMatch } from '@/shared/types/RowMatch'
import type { MatchCat } from '@/shared/types/MatchCat'
export function txnMatches(t: Pick<Transaction, 'merchant' | 'cat' | 'sub'>, m: RowMatch | null | undefined): boolean {
  if (!m) return false
  const inCat = (c: MatchCat): boolean => t.cat === c.cat && (c.sub == null || t.sub === c.sub)
  if (m.merchant != null && t.merchant === m.merchant) return true
  if (t.merchant != null && m.merchants?.includes(t.merchant)) return true
  if (m.cat != null && inCat({ cat: m.cat, sub: m.sub })) return true
  return !!m.cats?.some(inCat)
}
