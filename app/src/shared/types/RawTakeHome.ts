import type { Deduction } from '@/shared/types/Deduction'

// A take-home save as it may be stored. Older saves had k401Pct and medicalMo instead of a deductions list.
export interface RawTakeHome {
  salary: number
  deductions?: Deduction[]
  k401Pct?: number
  medicalMo?: number
}
