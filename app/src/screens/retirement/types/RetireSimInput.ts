import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetireSimPay } from '@/screens/retirement/types/RetireSimPay'

// Everything the year-by-year projection needs, already resolved from the page's inputs.
// `startSavings` is after any Start in debt hole. `events` holds only the events that
// count (a debt payoff event that does not apply is left out). `freed(age)` is what paid
// off debts free up that working year, already split by the Budget allocation.
// `salary` is today's gross pay, shown in the Pay column. `pay` is the pay plan; without
// it every working year uses `base401k` and `contribSavings`, exactly as before the plan.
export interface RetireSimInput {
  age: number
  accessAge: number
  endAge: number
  start401k: number
  startSavings: number
  base401k: number
  extras401k: number
  contribSavings: number
  freed: (age: number) => number
  withdrawMo: number
  ssMonthly: number
  ssClaimAge: number
  r: number
  rAfter: number
  taxPct: number
  events: Pick<RetireEvent, 'kind' | 'age' | 'repeat' | 'amount' | 'years' | 'auto'>[]
  salary?: number
  pay?: RetireSimPay
}
