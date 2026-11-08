import type { BudgetRow } from '@/shared/types/BudgetRow'

// How much of a budget row's monthly amount falls inside [fromDay, toDay]
// (both 1-31, inclusive, within one generic month cycle — no calendar dates).
// Dated rows: included once if their billing day falls in range. Prorated rows:
// scaled by days-in-range ÷ the real current month's length. Everything else
// (unknown timing): counted in full — same conservative rule as Rest of month.
// Days past the month's end count as its last day: a range ending on 31 means "end of
// month", and a row billed on the 31st comes due on the 28th in February.
export function amountInDayRange(row: BudgetRow, fromDay: number, toDay: number, daysInMonth: number): number {
  const amt = Number(row.amount) || 0
  const from = Math.max(1, fromDay)
  const to = Math.min(toDay, daysInMonth)
  if (row.day != null) {
    const day = Math.min(row.day, daysInMonth)
    return day >= from && day <= to ? amt : 0
  }
  if (row.prorate) {
    const days = Math.max(0, to - from + 1)
    return (amt * days) / daysInMonth
  }
  return amt
}
