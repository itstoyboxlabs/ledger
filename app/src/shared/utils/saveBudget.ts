import { httpPost } from '@/shared/utils/httpPost'
import { idbSet } from '@/shared/utils/idbSet'
import { isLocal } from '@/shared/utils/isLocal'
import type { BudgetFile } from '@/shared/types/BudgetFile'

export async function saveBudget(budget: BudgetFile): Promise<void> {
  if (isLocal()) return httpPost('/api/budget', budget)
  return idbSet('budget', budget)
}
