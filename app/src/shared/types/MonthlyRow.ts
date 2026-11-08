// One month on record: income, spending, net, plus spending per category under the category's own name.
export interface MonthlyRow {
  m: string // YYYY-MM
  income: number
  spending: number
  net: number
  [category: string]: string | number
}
