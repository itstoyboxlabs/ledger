// Retirement projection — year-by-year from current age to end age, two phases:
// working (contributions in) and retired (withdrawals out); 401k rolls into the
// pool at the access age. Return rate comes from the editable portfolio table.
import type { PortfolioRow } from '@/screens/retirement/types/PortfolioRow'

export const DEFAULT_PORTFOLIO: PortfolioRow[] = [{ name: 'Index fund', alloc: 100, perf: 7 }]
