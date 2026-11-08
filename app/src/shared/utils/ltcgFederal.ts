import { FED } from '@/shared/constants/FED'
import { LTCG } from '@/shared/constants/LTCG'
import type { LtcgFederalResult } from '@/shared/types/LtcgFederalResult'

// federal long-term gains tax on `gain` stacked on top of `base` ordinary income
export function ltcgFederal(base: number, gain: number): LtcgFederalResult {
  if (gain <= 0) return { fed: 0, niit: 0, total: 0 }
  const ordinary = Math.max(0, base - FED.standardDeduction)
  const top = ordinary + gain
  const inBand = (lo: number, hi: number) => Math.max(0, Math.min(top, hi) - Math.max(ordinary, lo))
  const fed = 0.15 * inBand(LTCG.zeroTo, LTCG.fifteenTo) + 0.2 * inBand(LTCG.fifteenTo, Infinity)
  const niit = LTCG.niitRate * Math.min(gain, Math.max(0, base + gain - LTCG.niitOver))
  return { fed, niit, total: fed + niit }
}
