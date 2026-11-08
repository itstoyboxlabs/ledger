import type { PortfolioRow } from '@/screens/retirement/types/PortfolioRow'

// The portfolio's total allocation and its return weighted by allocation (0 when nothing is allocated).
export function weightedReturn(rows: PortfolioRow[]): { total: number; avg: number } {
  const total = rows.reduce((s, x) => s + x.alloc, 0)
  return { total, avg: total > 0 ? rows.reduce((s, x) => s + x.alloc * x.perf, 0) / total : 0 }
}
