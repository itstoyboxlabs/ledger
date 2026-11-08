// A share of what is left over each month: `target` is 'savings' or a budget row id, `pct` is 0 to 100.
export interface LeftoverAllocation {
  id: string
  target: string
  pct: number
}
