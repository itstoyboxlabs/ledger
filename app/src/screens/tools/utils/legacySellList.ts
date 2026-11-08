import type { ToolList } from '@/screens/tools/types/ToolList'
import type { ToolListItem } from '@/screens/tools/types/ToolListItem'

export function legacySellList(): ToolList[] {
  try {
    const items = JSON.parse(localStorage.getItem('ledger:sellItems') || 'null')
    if (Array.isArray(items) && items.every((it: Partial<ToolListItem> | null) => it && typeof it.id === 'string' && typeof it.amount === 'number')) {
      return [{
        id: 'sell',
        title: 'Selling stuff',
        description: 'List what you plan to sell and what you expect to get for each.',
        items,
      }]
    }
  } catch { /* unreadable, start with no lists */ }
  return []
}
