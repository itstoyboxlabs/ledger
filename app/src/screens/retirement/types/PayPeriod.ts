import type { PaySource } from '@/screens/retirement/enums/PaySource'

// One stretch of your working life in the pay plan (`retireCalc.pay.periods`). It only
// says what goes into the 401k and savings, not what you earn.
// The period covers ages `fromAge` up to, not including, `toAge` (until 45 means 45 is
// the next period's first year). 'retire' means it runs until the retire age. A number
// past the retire age means you keep putting money away after you retire.
// The 401k comes from `takeHomeFrom`: today's Take-home tool, the Take-home preset
// `takeHomePreset` (an id; its 401k line plus match, none means 0), or `k401` typed
// dollars a year. Savings come from `saveFrom`: today's Budget, the Budget preset
// `savePreset` (its leftover), or `savings` typed dollars a year. Typed values are also
// the fallback when a preset is deleted. `raisePct` grows both every year of the period.
export interface PayPeriod {
  id: string
  label: string
  fromAge: number
  toAge: number | 'retire'
  raisePct: number
  takeHomeFrom: PaySource
  takeHomePreset: string
  k401: number
  saveFrom: PaySource
  savePreset: string
  savings: number
}
