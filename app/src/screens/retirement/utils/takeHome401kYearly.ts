import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import { is401kKind } from '@/shared/utils/is401kKind'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'

// what you put into a 401k yourself each year (no employer match)
export function takeHome401kYearly(th: RawTakeHome): number {
  return takeHomeBreakdown(th, 'tx').lines
    .filter((l) => is401kKind(l.kind))
    .reduce((s, l) => s + l.yearly, 0)
}
