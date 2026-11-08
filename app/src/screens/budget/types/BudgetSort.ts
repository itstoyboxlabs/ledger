import type { SortDirection } from '@/shared/enums/SortDirection'

// Column sort for the budget tables. key null = file order for expenses, biggest first for subscriptions.
export interface BudgetSort {
  key: string | null
  dir: SortDirection
}
