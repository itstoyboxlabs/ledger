import type { DeductionKind } from '@/shared/enums/DeductionKind'
import type { DeductionTax } from '@/shared/enums/DeductionTax'

// [kind, label, which taxes the money skips]
export type DeductionKindEntry = readonly [kind: DeductionKind, label: string, tax: DeductionTax]
