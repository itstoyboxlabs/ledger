import { K401_DEFERRAL_LIMIT } from '@/shared/constants/K401_DEFERRAL_LIMIT'
import { is401kKind } from '@/shared/utils/is401kKind'
import type { DeductionLine } from '@/shared/types/DeductionLine'

// Traditional and Roth 401k share one yearly limit. Lines are filled in order, so a later
// 401k line gets whatever room is left. A line cut by the limit is marked `capped`.
export function cap401kLines(lines: DeductionLine[]): DeductionLine[] {
  let room = K401_DEFERRAL_LIMIT
  return lines.map((l) => {
    if (!is401kKind(l.kind)) return l
    const yearly = Math.min(l.yearly, room)
    room -= yearly
    return yearly < l.yearly ? { ...l, yearly, capped: true } : l
  })
}
