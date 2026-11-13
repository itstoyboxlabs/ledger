import type { BudgetPresetData } from '@/shared/types/BudgetPresetData'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import { isObj } from '@/shared/utils/isObj'
import { normalizeLeftover } from '@/shared/utils/normalizeLeftover'

// A saved Budget preset's data, whichever shape it was saved in. The first presets were just
// the list of rows. Null when it is neither.
export function readBudgetPreset(data: unknown): BudgetPresetData | null {
  if (Array.isArray(data)) return { rows: data as BudgetRow[] }
  if (!isObj(data) || !Array.isArray((data as { rows?: unknown }).rows)) return null
  const d = data as { rows: BudgetRow[]; dismissedSubs?: unknown; leftover?: unknown }
  return {
    rows: d.rows,
    ...(isObj(d.dismissedSubs) ? { dismissedSubs: d.dismissedSubs as BudgetPresetData['dismissedSubs'] } : {}),
    ...(Array.isArray(d.leftover) ? { leftover: normalizeLeftover(d.leftover) } : {}),
  }
}
