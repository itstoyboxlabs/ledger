import { FED_BY_FILING } from '@/shared/constants/FED_BY_FILING'
import { LTCG_BY_FILING } from '@/shared/constants/LTCG_BY_FILING'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import type { LtcgFederalResult } from '@/shared/types/LtcgFederalResult'

// federal long-term gains tax on `gain` stacked on top of `base` ordinary income. The standard
// deduction comes off ordinary income first, and any of it left over shelters the gain.
export function ltcgFederal(base: number, gain: number, filing: FilingStatus = FilingStatus.single): LtcgFederalResult {
  if (gain <= 0) return { fed: 0, niit: 0, total: 0 }
  const ded = (FED_BY_FILING[filing] ?? FED_BY_FILING.single).standardDeduction
  const lt = LTCG_BY_FILING[filing] ?? LTCG_BY_FILING.single
  const ordinary = Math.max(0, base - ded)
  const top = Math.max(0, base + gain - ded)
  const inBand = (lo: number, hi: number) => Math.max(0, Math.min(top, hi) - Math.max(ordinary, lo))
  const fed = 0.15 * inBand(lt.zeroTo, lt.fifteenTo) + 0.2 * inBand(lt.fifteenTo, Infinity)
  const niit = lt.niitRate * Math.min(gain, Math.max(0, base + gain - lt.niitOver))
  return { fed, niit, total: fed + niit }
}
