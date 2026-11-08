// Where the Budget page's monthly income comes from: false = statements, true = the Take-home tool, 'manual' = a
// number you typed in `amount`.
export interface IncomeOverride {
  active: boolean | 'manual'
  amount?: number
}
