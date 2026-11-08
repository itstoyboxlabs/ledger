import { isBudgetRowHidden } from '@/shared/utils/isBudgetRowHidden'
import { budgetEffRows } from '@/shared/utils/budgetEffRows'
import { normalizeBudgetRow } from '@/shared/utils/normalizeBudgetRow'
import type { BudgetFile } from '@/shared/types/BudgetFile'

// what the Budget page counts as "Budgeted expenses", from a budget file
export const budgetExpensesOf = (d: Pick<BudgetFile, 'rows' | 'dismissedSubs'>): number =>
  budgetEffRows((d.rows || []).map(normalizeBudgetRow), d.dismissedSubs)
    .filter((r) => !r.hidden && !isBudgetRowHidden(r))
    .reduce((s, r) => s + (Number(r.amount) || 0), 0)
