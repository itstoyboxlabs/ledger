import { itemsTotal } from '@/shared/utils/itemsTotal'
import { newItemId } from '@/shared/utils/newItemId'
import { BudgetRowType } from '@/shared/enums/BudgetRowType'
import { SubItemMode } from '@/shared/enums/SubItemMode'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { RawBudgetRow } from '@/shared/types/RawBudgetRow'

// Bring any saved row up to the current shape, so old files and old presets keep
// working: a bare `items` list (flat items) or a `dining` plan (two week items)
// becomes a breakdown, and every row gets a `type`.
export function normalizeBudgetRow(r: RawBudgetRow): BudgetRow {
  if (!r || typeof r !== 'object') return r
  const { dining, ...rest } = r
  let row: RawBudgetRow = rest
  if (dining && typeof dining === 'object' && !Array.isArray(row.items)) {
    row.items = [
      { id: 'uber', name: 'Uber Eats', mode: SubItemMode.week, amount: dining.uberAvg ?? 0, perWeek: dining.uberPerWeek ?? 0 },
      { id: 'rest', name: 'Restaurants', mode: SubItemMode.week, amount: dining.restAvg ?? 0, perWeek: dining.restPerWeek ?? 0 },
    ]
    row.amount = itemsTotal(row.items)
  }
  if (row.type !== BudgetRowType.simple && row.type !== BudgetRowType.breakdown) {
    row = { ...row, type: Array.isArray(row.items) ? BudgetRowType.breakdown : BudgetRowType.simple }
  }
  if (row.type === BudgetRowType.breakdown) {
    row = {
      ...row,
      items: (Array.isArray(row.items) ? row.items : []).map((it) => ({
        id: it.id ?? newItemId(),
        name: it.name ?? '',
        mode: it.mode === SubItemMode.week ? SubItemMode.week : SubItemMode.month,
        amount: Number(it.amount) || 0,
        perWeek: Number(it.perWeek) || 0,
      })),
    }
  } else if ('items' in row) {
    const { items: _drop, ...clean } = row
    row = clean
  }
  return row as BudgetRow
}
