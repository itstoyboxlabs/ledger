import type { Debt } from '@/shared/types/Debt'

// The debts with one moved a place up (-1) or down (1). The order is the priority: the first debt
// is paid off first. A debt already at that end stays where it is.
export function moveDebt(debts: Debt[], id: string, step: -1 | 1): Debt[] {
  const i = debts.findIndex((d) => d.id === id)
  const j = i + step
  if (i < 0 || j < 0 || j >= debts.length) return debts
  const next = [...debts]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}
