import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'
// What to do with what is left. budget.json carries `leftover: [{ id, target, pct }]`
// where target is 'savings' or a budget row id. Leftover is income minus every counted
// row, never below zero, so nothing is taken from anything when you overspend.
export function normalizeLeftover(list: unknown): LeftoverAllocation[] {
  if (!Array.isArray(list)) return []
  return (list as Partial<LeftoverAllocation>[])
    .filter((a): a is Partial<LeftoverAllocation> & { id: string } => !!a && typeof a === 'object' && typeof a.id === 'string')
    .map((a) => ({
      id: a.id,
      target: typeof a.target === 'string' ? a.target : 'savings',
      pct: Math.min(100, Math.max(0, Number(a.pct) || 0)),
    }))
}
