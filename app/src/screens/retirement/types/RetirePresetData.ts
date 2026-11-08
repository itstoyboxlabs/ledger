import type { PortfolioAfter } from '@/screens/retirement/types/PortfolioAfter'
import type { PortfolioRow } from '@/screens/retirement/types/PortfolioRow'
import type { RetireState } from '@/screens/retirement/types/RetireState'

// What a Retirement preset stores. Old presets can miss fields or use the old shape.
export interface RetirePresetData {
  c: RetireState
  port: PortfolioRow[]
  portAfter: PortfolioAfter
  includeDebt: boolean
}
