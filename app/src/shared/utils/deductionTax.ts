import { deductionKind } from '@/shared/utils/deductionKind'
import type { DeductionTax } from '@/shared/enums/DeductionTax'

export const deductionTax = (kind: string): DeductionTax => deductionKind(kind)[2]
