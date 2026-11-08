import type { PortfolioRow } from '@/screens/retirement/types/PortfolioRow'

// The funds used after retiring. `same` means keep using the working funds (rows are then ignored).
export interface PortfolioAfter {
  same: boolean
  rows: PortfolioRow[]
}
