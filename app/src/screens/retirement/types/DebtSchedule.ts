// When a debt clears and how many months of its payment are freed in that year.
export interface DebtSchedule {
  payoffAge: number
  freedMonthsInPayoffYear: number
}
