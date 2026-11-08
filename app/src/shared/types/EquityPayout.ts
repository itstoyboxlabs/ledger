import type { ExtraTaxResult } from '@/shared/types/ExtraTaxResult'
import type { LtcgExtraResult } from '@/shared/types/LtcgExtraResult'

export interface EquityPayout {
  delta: number
  gross: number
  years: number
  slice: number
  tax: ExtraTaxResult | LtcgExtraResult
  net: number
  longTerm: boolean
}
