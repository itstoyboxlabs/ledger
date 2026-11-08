import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'

// Changes one leftover share. Its percent is kept between 0 and whatever the other shares
// leave, so the shares never add up past 100.
export function patchAllocation(alloc: LeftoverAllocation[], id: string, patch: Partial<LeftoverAllocation>): LeftoverAllocation[] {
  return alloc.map((a) => {
    if (a.id !== id) return a
    const next = { ...a, ...patch }
    const others = alloc.filter((x) => x.id !== id).reduce((s, x) => s + x.pct, 0)
    return { ...next, pct: Math.min(Math.max(0, Number(next.pct) || 0), Math.max(0, 100 - others)) }
  })
}
