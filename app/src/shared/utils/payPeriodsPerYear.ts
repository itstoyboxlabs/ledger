// pay periods a year (weekly 52, biweekly 26, semi-monthly 24, monthly 12), picked by the
// median gap in days between paydays. Fewer than two paydays means semi-monthly.
const FREQUENCIES = [52, 26, 24, 12]
const DAY = 86_400_000

export function payPeriodsPerYear(dates: string[]): number {
  const days = [...new Set(dates)].map((d) => Date.parse(d + 'T12:00Z')).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b)
  if (days.length < 2) return 24
  const gaps = days.slice(1).map((d, i) => (d - (days[i] as number)) / DAY).sort((a, b) => a - b)
  const mid = Math.floor(gaps.length / 2)
  const median = gaps.length % 2 ? (gaps[mid] as number) : ((gaps[mid - 1] as number) + (gaps[mid] as number)) / 2
  return FREQUENCIES.reduce((best, f) => (Math.abs(365.25 / f - median) < Math.abs(365.25 / best - median) ? f : best))
}
