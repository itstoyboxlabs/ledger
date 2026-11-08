import { FED } from '@/shared/constants/FED'
import { FED_MFJ } from '@/shared/constants/FED_MFJ'
import type { FilingStatus } from '@/shared/enums/FilingStatus'
import type { FederalTax } from '@/shared/types/FederalTax'

// the federal brackets and standard deduction for each filing status
export const FED_BY_FILING: Record<FilingStatus, FederalTax> = { single: FED, mfj: FED_MFJ }
