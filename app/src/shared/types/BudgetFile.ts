import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { DismissedSubs } from '@/shared/types/DismissedSubs'
import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'

export interface BudgetFile {
  updated?: string
  rows: BudgetRow[]
  dismissedSubs?: DismissedSubs
  leftover?: LeftoverAllocation[]
}
