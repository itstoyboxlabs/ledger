import type { BudgetTableItem } from '@/screens/budget/types/BudgetTableItem'
import type { GhostRow } from '@/screens/budget/types/GhostRow'

// Table body entries are real rows, ghost rows (spending no row covers) or section markers.
export function isGhostRow(r: BudgetTableItem): r is GhostRow {
  return r !== null && typeof r === 'object' && '__ghost' in r
}
