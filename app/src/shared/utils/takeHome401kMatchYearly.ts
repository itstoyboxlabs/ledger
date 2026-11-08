import { is401kKind } from '@/shared/utils/is401kKind'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

// what your employer adds on top each year, from each 401k deduction's `match`
export function takeHome401kMatchYearly(th: RawTakeHome): number {
  return takeHomeBreakdown(th, 'tx').lines
    .filter((l) => is401kKind(l.kind))
    .reduce((s, l) => s + (l.yearly * (Number(l.match) || 0)) / 100, 0)
}
