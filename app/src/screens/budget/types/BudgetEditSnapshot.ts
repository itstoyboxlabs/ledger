import type { BudgetRow } from '@/shared/types/BudgetRow'

// The row as it was when the edit modal opened, so Cancel can put it back. `__new` marks a row created for the edit.
export type BudgetEditSnapshot = BudgetRow & { __new?: boolean }
