import type { LogSort } from '@/screens/log/types/LogSort'

// Clicking a header: the same one flips the direction, a new one starts newest or biggest first
// for date and amount and A to Z for text.
export function nextLogSort(sort: LogSort, key: LogSort['key']): LogSort {
  if (sort.key === key) return { key, dir: sort.dir === 1 ? -1 : 1 }
  return { key, dir: key === 'date' || key === 'amount' ? -1 : 1 }
}
