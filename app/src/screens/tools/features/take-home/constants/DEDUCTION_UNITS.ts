import type { DeductionUnit } from '@/shared/enums/DeductionUnit'

export const DEDUCTION_UNITS: readonly (readonly [DeductionUnit, string])[] = [
  ['pct', '% of salary'],
  ['mo', '$ per month'],
  ['yr', '$ per year'],
]
