// One stretch of your working life in the pay plan (`retireCalc.pay.periods`).
// The period covers ages `fromAge` up to, not including, `toAge`. 'retire' means it
// runs until the retire age. A number past the retire age means you keep working
// (part time, say) after you retire, and its pay lowers what you take out.
// `k401` and `savings` are 'auto' (follow the Take-home 401k and the Budget) or typed:
// `k401` is a percent of pay (0 means no 401k), `savings` is dollars a year.
export interface PayPeriod {
  id: string
  label: string
  fromAge: number
  toAge: number | 'retire'
  salary: number
  raisePct: number
  k401: number | 'auto'
  savings: number | 'auto'
}
