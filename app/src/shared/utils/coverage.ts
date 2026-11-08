import { getPeriods } from '@/shared/utils/getPeriods'
import type { CoverageResult } from '@/shared/types/CoverageResult'

// For a YYYY-MM month + account, how much of the month do the loaded statements cover?
// Returns {full: true} or {full: false, ranges: "May 14 – Jun 11", missing: 'start'|'end'|'both'|'all'}
export function coverage(ym: string, account: string): CoverageResult {
  const periods = Object.values(getPeriods()).filter((p) => p.account === account)
  const [y, m] = ym.split('-').map(Number)
  const monthStart = `${ym}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const monthEnd = `${ym}-${String(lastDay).padStart(2, '0')}`
  // union of covered days within the month (periods don't overlap per account)
  const covered: [string, string][] = periods
    .map((p): [string, string] => [p.start > monthStart ? p.start : monthStart, p.end < monthEnd ? p.end : monthEnd])
    .filter(([s, e]) => s <= e)
    .sort()
  if (!covered.length) return { full: false, missing: 'all' }
  // merge contiguous ranges
  const merged = [covered[0]]
  for (const [s, e] of covered.slice(1)) {
    const last = merged[merged.length - 1]
    const nextDay = new Date(last[1] + 'T12:00')
    nextDay.setDate(nextDay.getDate() + 1)
    const contiguous = s <= nextDay.toISOString().slice(0, 10)
    if (contiguous) last[1] = e > last[1] ? e : last[1]
    else merged.push([s, e])
  }
  const full = merged.length === 1 && merged[0][0] === monthStart && merged[0][1] === monthEnd
  return { full, ranges: merged }
}
