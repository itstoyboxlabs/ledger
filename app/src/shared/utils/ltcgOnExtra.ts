import { FilingStatus } from '@/shared/enums/FilingStatus'
import { ltcgFederal } from '@/shared/utils/ltcgFederal'
import { taxOn } from '@/shared/utils/taxOn'
import type { LtcgExtraResult } from '@/shared/types/LtcgExtraResult'

// tax on a long-term gain on top of a salary: federal 0/15/20% plus NIIT, and the state
// (plus NYC) taxes it as ordinary income. No FICA, since it is not wages.
export function ltcgOnExtra(base: number, gain: number, stateKey: string, filing: FilingStatus = FilingStatus.single): LtcgExtraResult {
  if (gain <= 0) return { total: 0, effective: 0, fed: 0, niit: 0, state: 0 }
  const f = ltcgFederal(base, gain, filing)
  const a = taxOn(base + gain, stateKey, filing)
  const b = taxOn(base, stateKey, filing)
  const state = a.state + a.local - (b.state + b.local)
  const total = f.total + state
  return { total, effective: total / gain, fed: f.fed, niit: f.niit, state }
}
