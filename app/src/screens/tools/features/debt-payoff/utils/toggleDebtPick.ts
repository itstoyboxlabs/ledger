// The ids of the debts to pay off after one is ticked or unticked. An empty list means every
// debt. The last ticked debt cannot be unticked, and ticking them all goes back to empty.
export function toggleDebtPick(picks: string[], allIds: string[], id: string): string[] {
  const current = picks.length ? picks.filter((p) => allIds.includes(p)) : allIds
  const next = current.includes(id) ? current.filter((p) => p !== id) : [...current, id]
  if (next.length === 0) return picks
  return next.length === allIds.length ? [] : next
}
