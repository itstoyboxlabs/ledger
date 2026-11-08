import { defaultMatch } from '@/shared/utils/defaultMatch'
import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'
import type { RowMatch } from '@/shared/types/RowMatch'

export const rowMatch = (row: BudgetRowLike): RowMatch | null => (row.match !== undefined ? row.match : defaultMatch(row))
