import type { BudgetRow } from '@/shared/types/BudgetRow'

// How much of a budget row's monthly amount falls inside [fromDay, toDay]
// (both 1-31, inclusive, within one generic month cycle — no calendar dates).
// Dated rows: included once if their billing day falls in range. Prorated rows:
// scaled by days-in-range ÷ the real current month's length. Everything else
// (unknown timing): counted in full — same conservative rule as Rest of month.
export function amountInDayRange(row: BudgetRow, fromDay: number, toDay: number, daysInMonth: number): number {
  const amt = Number(row.amount) || 0
  if (row.day != null) {
    return row.day >= fromDay && row.day <= toDay ? amt : 0
  }
  if (row.prorate) {
    const days = toDay - fromDay + 1
    return (amt * days) / daysInMonth
  }
  return amt
}
