import type { SortDirection } from '@/shared/enums/SortDirection'

// Sorts a copy of `list` by each item's value. Items with no value (null) go last either way.
export function sortByValue<R>(list: R[], valueOf: (r: R) => string | number | null, dir: SortDirection): R[] {
  const sign = dir === 'asc' ? 1 : -1
  return list
    .map((r): [R, string | number | null] => [r, valueOf(r)])
    .sort(([, a], [, b]) => {
      if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1
      return (a < b ? -1 : a > b ? 1 : 0) * sign
    })
    .map(([r]) => r)
}
