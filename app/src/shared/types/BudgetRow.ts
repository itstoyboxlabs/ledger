import type { BudgetRowSource } from '@/shared/enums/BudgetRowSource'
import type { BudgetRowType } from '@/shared/enums/BudgetRowType'
import type { RowMatch } from '@/shared/types/RowMatch'
import type { SubItem } from '@/shared/types/SubItem'

// A line in the budget. `type` is missing on very old saves (normalizeBudgetRow fills it in). `match` set to null
// means "count nothing toward Actual"; left out means "use the default match".
export interface BudgetRow {
  id: string
  name: string
  amount: number
  type?: BudgetRowType
  source?: BudgetRowSource
  day?: number
  prorate?: boolean
  hidden?: boolean
  trackInLog?: boolean
  match?: RowMatch | null
  items?: SubItem[]
}
