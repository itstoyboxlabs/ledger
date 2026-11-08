import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'
export const leftoverShare = (list: LeftoverAllocation[], target: string, leftover: number): number =>
  list.filter((a) => a.target === target).reduce((s: number, a) => s + (leftover * a.pct) / 100, 0)
