import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'

// The "Pay off a debt" event that applies to each debt, by debt id. Only an event whose
// age falls inside the plan (from the current age to the end age) counts, and the first
// one wins. A debt with no such event keeps its normal schedule and stays in the hole.
export function payoffEventsByDebt(events: RetireEvent[], debtIds: string[], age: number, endAge: number): Record<string, RetireEvent> {
  const out: Record<string, RetireEvent> = {}
  for (const e of events) {
    const id = e.debtId ?? ''
    if (e.kind !== 'debt' || !debtIds.includes(id) || id in out) continue
    if (e.age < age || e.age > endAge) continue
    out[id] = e
  }
  return out
}
