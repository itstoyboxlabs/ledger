import type { DeductionLine } from '@/shared/types/DeductionLine'

export interface TakeHomeBreakdown {
  salary: number
  lines: DeductionLine[]
  fed: number
  state: number
  local: number
  fica: number
  taxes: number
  net: number
}
