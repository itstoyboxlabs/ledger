import type { StockType } from '@/shared/enums/StockType'

export interface StockInputs {
  type: StockType
  exit: number
  strike: number
  shares: number
  salary: number
  years: number
  heldOver: boolean
}
