import type { LogEntry } from '@/shared/types/LogEntry'

// What was logged against each row and how many entries. Counted apart from the sum, so
// entries that net to zero still count as logged.
export function logTotalsByRow(entries: LogEntry[]): { spent: Record<string, number>; count: Record<string, number> } {
  const spent: Record<string, number> = {}
  const count: Record<string, number> = {}
  for (const e of entries) {
    spent[e.rowId] = (spent[e.rowId] ?? 0) + e.amount
    count[e.rowId] = (count[e.rowId] ?? 0) + 1
  }
  return { spent, count }
}
