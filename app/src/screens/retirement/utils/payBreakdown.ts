import type { PayMath } from '@/screens/retirement/types/PayMath'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import { DeductionKind } from '@/shared/enums/DeductionKind'
import { DeductionUnit } from '@/shared/enums/DeductionUnit'
import { is401kKind } from '@/shared/utils/is401kKind'
import { normalizeTakeHome } from '@/shared/utils/normalizeTakeHome'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import { takeHome401kMatchYearly } from '@/shared/utils/takeHome401kMatchYearly'
import { takeHome401kYearly } from '@/screens/retirement/utils/takeHome401kYearly'

// One year's gross pay run through the Take-home deductions and tax. With 'auto' the
// Take-home 401k lines apply as they are. A typed percent replaces them with one 401k
// line at that percent, keeping the Take-home employer match (0 means no 401k). The
// yearly deferral limit applies either way, and the match follows the capped amount.
// No pay means no take-home and no 401k.
export function payBreakdown(takeHome: RawTakeHome, taxState: string, gross: number, k401: PayPeriod['k401']): PayMath {
  if (!(gross > 0)) return { net: 0, own: 0, match: 0 }
  const th = normalizeTakeHome(takeHome)
  const deductions = k401 === 'auto'
    ? th.deductions
    : [
      ...th.deductions.filter((d) => !is401kKind(d.kind)),
      ...(k401 > 0
        ? [{ id: 'plan401k', kind: DeductionKind.k401, unit: DeductionUnit.pct, amount: k401, match: th.deductions.find((d) => is401kKind(d.kind))?.match ?? 0 }]
        : []),
    ]
  const at = { salary: gross, deductions }
  return { net: takeHomeBreakdown(at, taxState).net, own: takeHome401kYearly(at), match: takeHome401kMatchYearly(at) }
}
