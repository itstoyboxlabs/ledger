import type { SubItem } from '@/shared/types/SubItem'
/* ---------- budget vs. actual ---------- */

/* ---------- budget rows: sub items and matching ---------- */

// A row is `simple` (name and monthly amount) or `breakdown` (name plus sub items, and
// the amount is their sum). A sub item is { id, name, mode, amount, perWeek }: in
// `month` mode `amount` is a flat monthly amount, in `week` mode the month is
// `amount` (average cost) x `perWeek` (times a week) x 4, the page's 4-weeks-a-month rule.
export const itemMonthly = (it: Partial<Pick<SubItem, 'mode' | 'amount' | 'perWeek'>>): number => {
  const a = Number(it.amount) || 0
  return it.mode === 'week' ? a * (Number(it.perWeek) || 0) * 4 : a
}
