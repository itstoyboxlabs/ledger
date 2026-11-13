import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { DismissedSubs } from '@/shared/types/DismissedSubs'
import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'

// What a Budget preset holds: the expense rows, the subscriptions you removed and what to
// do with what is left. The last two are left out of presets saved before they were part of one.
export interface BudgetPresetData {
  rows: BudgetRow[]
  dismissedSubs?: DismissedSubs
  leftover?: LeftoverAllocation[]
}
