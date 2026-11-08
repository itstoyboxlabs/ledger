// What a row still has to spend this month, for "Remaining this month". `amount` already
// includes any share of the leftover. A row with a billing day counts only while that day is
// still to come, a prorated row scales by the days left, and anything else counts in full
// (its date is unknown).
export function remainingThisMonth(
  amount: number,
  row: { day?: number | null; prorate?: boolean },
  today: number,
  daysInMonth: number,
): number {
  if (row.day != null) return row.day > today ? amount : 0
  if (row.prorate) return (amount * (daysInMonth - today)) / daysInMonth
  return amount
}
