import { FED } from '@/shared/constants/FED'
import { STATES } from '@/shared/constants/STATES'
import { fica } from '@/shared/utils/fica'
import { progressive } from '@/shared/utils/progressive'
import type { TaxResult } from '@/shared/types/TaxResult'

// total tax on `gross` annual income in `stateKey`; includes federal + FICA + state (+ NYC local)
export function taxOn(gross: number, stateKey: string): TaxResult {
  if (gross <= 0) return { total: 0, effective: 0, fed: 0, fica: 0, state: 0, local: 0 }
  const st = STATES[stateKey] ?? STATES.tn
  const fed = progressive(Math.max(0, gross - FED.standardDeduction), FED.brackets)
  const f = fica(gross)
  const stateTaxable = Math.max(0, gross - st.deduction)
  const state = progressive(stateTaxable, st.brackets)
  const local = st.local ? progressive(stateTaxable, st.local) : 0
  const total = fed + f + state + local
  return { total, effective: total / gross, fed, fica: f, state, local }
}
