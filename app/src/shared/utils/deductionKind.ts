import { DEDUCTION_KINDS } from '@/shared/constants/DEDUCTION_KINDS'
import type { DeductionKindEntry } from '@/shared/types/DeductionKindEntry'

export const deductionKind = (kind: string): DeductionKindEntry => DEDUCTION_KINDS.find(([k]) => k === kind) ?? DEDUCTION_KINDS[0]
