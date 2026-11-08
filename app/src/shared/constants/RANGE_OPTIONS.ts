import type { RangeOption } from '@/shared/types/RangeOption'
// Spending page scope: all months, one month, or a range ending at the newest complete
// month. Returns the months it covers.
export const RANGE_OPTIONS: readonly RangeOption[] = [
  ['lastMonth', 'Last month'],
  ['last3', 'Last 3 months'],
  ['last6', 'Last 6 months'],
  ['ytd', 'Year to date'],
]
