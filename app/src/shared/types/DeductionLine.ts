import type { Deduction } from '@/shared/types/Deduction'

export interface DeductionLine extends Deduction {
  yearly: number
  // true when the yearly 401k limit cut this line below what was asked for
  capped?: boolean
}
