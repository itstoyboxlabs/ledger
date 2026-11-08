import { FED } from '@/shared/constants/FED'
import { FED_MFJ } from '@/shared/constants/FED_MFJ'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import type { StateTax } from '@/shared/types/StateTax'

// The state deduction for a filing status. The state tables are single filer only. The one
// married figure the app already knows is the federal standard deduction, so a state whose
// deduction follows the federal one (AZ, CO, DC and others in STATES) gets the joint federal
// deduction. Every other state keeps its single deduction and single brackets, so state tax
// for married filers is an approximation (usually a little high).
export function stateDeduction(st: StateTax, filing: FilingStatus = FilingStatus.single): number {
  if (filing === FilingStatus.mfj && st.deduction === FED.standardDeduction) return FED_MFJ.standardDeduction
  return st.deduction
}
