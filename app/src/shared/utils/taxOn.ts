import { FED_BY_FILING } from '@/shared/constants/FED_BY_FILING'
import { STATES } from '@/shared/constants/STATES'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import { fica } from '@/shared/utils/fica'
import { progressive } from '@/shared/utils/progressive'
import { stateDeduction } from '@/shared/utils/stateDeduction'
import type { TaxResult } from '@/shared/types/TaxResult'

// total tax on `gross` annual income in `stateKey`; includes federal + FICA + state (+ NYC local).
// `filing` picks the federal brackets and deduction (single by default, which is how the app
// always worked). State brackets are single filer for everyone, see stateDeduction.
export function taxOn(gross: number, stateKey: string, filing: FilingStatus = FilingStatus.single): TaxResult {
  if (gross <= 0) return { total: 0, effective: 0, fed: 0, fica: 0, state: 0, local: 0 }
  const st = STATES[stateKey] ?? STATES.tn
  const fedTable = FED_BY_FILING[filing] ?? FED_BY_FILING.single
  const fed = progressive(Math.max(0, gross - fedTable.standardDeduction), fedTable.brackets)
  const f = fica(gross, filing)
  const stateTaxable = Math.max(0, gross - stateDeduction(st, filing))
  const state = progressive(stateTaxable, st.brackets)
  const local = st.local ? progressive(stateTaxable, st.local) : 0
  const total = fed + f + state + local
  return { total, effective: total / gross, fed, fica: f, state, local }
}
