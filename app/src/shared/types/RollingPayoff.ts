// When each debt clears when paid in priority order (see rollingPayoff). `spent[n]` is the money
// that went to the debts in month n + 1, which is the whole amount until the last month.
export interface RollingPayoff {
  months: (number | null)[]
  total: number | null
  spent: number[]
}
