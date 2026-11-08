// One fund in the portfolio table: its share of the money (percent) and what it earns a year (percent).
export interface PortfolioRow {
  name: string
  alloc: number
  perf: number
}
