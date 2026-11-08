// One month on the Trends and Cash flow charts: totals plus one number per category (keyed by category name).
export interface MonthlyRow {
  m: string // YYYY-MM
  income: number
  spending: number
  net: number
  [category: string]: string | number
}
