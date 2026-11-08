import { deductionKind } from '@/shared/utils/deductionKind'

export const deductionLabel = (kind: string): string => deductionKind(kind)[1]
