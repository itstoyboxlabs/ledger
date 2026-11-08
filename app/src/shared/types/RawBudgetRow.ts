import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { SubItem } from '@/shared/types/SubItem'

// A budget row as an old save may hold it: items may be missing fields, and the first `dining` plan
// became the Restaurants breakdown.
export interface RawBudgetRow extends Omit<BudgetRow, 'items'> {
  items?: Partial<SubItem>[]
  dining?: { uberAvg?: number; uberPerWeek?: number; restAvg?: number; restPerWeek?: number }
}
