import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'

// the leftover dollars aimed at one target ('savings' or a row id). Pass the ids of the
// rows that still exist as `liveIds` and a share aimed at a deleted row is not lost:
// it counts toward savings instead.
export const leftoverShare = (list: LeftoverAllocation[], target: string, leftover: number, liveIds?: string[]): number => {
  const live = liveIds && new Set(liveIds)
  const aimedAt = (a: LeftoverAllocation) => (!live || a.target === 'savings' || live.has(a.target) ? a.target : 'savings')
  return list.filter((a) => aimedAt(a) === target).reduce((s: number, a) => s + (leftover * a.pct) / 100, 0)
}
