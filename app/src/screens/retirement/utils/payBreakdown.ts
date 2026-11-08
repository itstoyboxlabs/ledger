import type { PayMath } from '@/screens/retirement/types/PayMath'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import { normalizeTakeHome } from '@/shared/utils/normalizeTakeHome'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import { takeHome401kMatchYearly } from '@/shared/utils/takeHome401kMatchYearly'
import { takeHome401kYearly } from '@/screens/retirement/utils/takeHome401kYearly'

// A Take-home setup at its own salary: take-home pay, what you put into the 401k
// (capped at the yearly deferral limit) and the employer match on that capped amount.
// No 401k line means nothing goes in and no match.
export function payBreakdown(takeHome: RawTakeHome, taxState: string, filing: FilingStatus = FilingStatus.single): PayMath {
  const th = normalizeTakeHome(takeHome)
  if (!(Number(th.salary) > 0)) return { net: 0, own: 0, match: 0 }
  return { net: takeHomeBreakdown(th, taxState, filing).net, own: takeHome401kYearly(th), match: takeHome401kMatchYearly(th) }
}
