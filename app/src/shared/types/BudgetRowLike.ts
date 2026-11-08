import type { BudgetRow } from '@/shared/types/BudgetRow'

// The part of a budget row that matching and live amounts read. Lets a not-yet-saved row (just a name and a source) be passed in.
export type BudgetRowLike = Pick<BudgetRow, 'name'> & Partial<BudgetRow>
