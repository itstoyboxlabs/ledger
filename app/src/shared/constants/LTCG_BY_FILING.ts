import { LTCG } from '@/shared/constants/LTCG'
import { LTCG_MFJ } from '@/shared/constants/LTCG_MFJ'
import type { FilingStatus } from '@/shared/enums/FilingStatus'
import type { LtcgThresholds } from '@/shared/types/LtcgThresholds'

// the long-term gains breakpoints and investment income tax threshold for each filing status
export const LTCG_BY_FILING: Record<FilingStatus, LtcgThresholds> = { single: LTCG, mfj: LTCG_MFJ }
