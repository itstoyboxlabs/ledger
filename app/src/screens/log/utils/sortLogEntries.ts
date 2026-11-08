import type { LogEntry } from '@/shared/types/LogEntry'
import type { LogSort } from '@/screens/log/types/LogSort'

// The entries table in the order of the clicked header. Ties fall back to newest first.
export function sortLogEntries(entries: LogEntry[], sort: LogSort, rowName: (rowId: string) => string): LogEntry[] {
  const valueOf = (e: LogEntry): string | number =>
    sort.key === 'amount' ? e.amount
    : sort.key === 'note' ? (e.note || '').toLowerCase()
    : sort.key === 'row' ? rowName(e.rowId).toLowerCase()
    : e.date
  return [...entries].sort((a, b) => {
    const va = valueOf(a), vb = valueOf(b)
    return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir || b.createdAt - a.createdAt
  })
}
