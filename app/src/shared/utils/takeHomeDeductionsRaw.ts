import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import type { Deduction } from '@/shared/types/Deduction'
import { DeductionKind } from '@/shared/enums/DeductionKind'
import { DeductionUnit } from '@/shared/enums/DeductionUnit'
// older saves had fixed k401Pct / medicalMo fields instead of a deductions list.
// This is the list as stored (no `match` filled in), so the one-time employer match
// migration in RetirementCalc can tell whether a save has ever carried a match.
export function takeHomeDeductionsRaw(th: Partial<RawTakeHome>): Deduction[] {
  if (Array.isArray(th.deductions)) return th.deductions
  return [
    { id: 'd401k', kind: DeductionKind.k401, unit: DeductionUnit.pct, amount: th.k401Pct ?? 4 },
    { id: 'dmed', kind: DeductionKind.insurance, unit: DeductionUnit.mo, amount: th.medicalMo ?? 150 },
  ]
}
