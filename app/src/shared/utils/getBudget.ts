import { httpGet } from '@/shared/utils/httpGet'
import { idbGet } from '@/shared/utils/idbGet'
import { isLocal } from '@/shared/utils/isLocal'
import type { BudgetFile } from '@/shared/types/BudgetFile'

/* ---------- budget { updated, rows, dismissedSubs } ---------- */

export async function getBudget(): Promise<BudgetFile> {
  if (isLocal()) return httpGet<BudgetFile>('/api/budget')
  return (await idbGet<BudgetFile>('budget')) ?? { rows: [], dismissedSubs: {} }
}
