import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetireSimPay } from '@/screens/retirement/types/RetireSimPay'

// Everything the year-by-year projection needs, already resolved from the page's inputs.
// `startSavings` is after any Start in debt hole. `events` holds only the events that
// count (a debt payoff event that does not apply is left out). `freed(age)` is what paid
// off debts free up that working year, already split by the Budget allocation.
// `pay` is the pay plan; without it every working year uses `base401k` and
// `contribSavings`, exactly as before the plan.
export interface RetireSimInput {
  age: number
  accessAge: number
  endAge: number
  start401k: number
  startSavings: number
  base401k: number
  contribSavings: number
  freed: (age: number) => number
  withdrawMo: number
  ssMonthly: number
  ssClaimAge: number
  r: number
  rAfter: number
  taxPct: number
  events: Pick<RetireEvent, 'kind' | 'age' | 'repeat' | 'amount' | 'years' | 'auto' | 'to' | 'untilRetire'>[]
  // with no plan, today's 401k and savings grow by this percent each working year
  raisePct?: number
  pay?: RetireSimPay
  // Tax on 401k withdrawals. When set, `start401k` is pre-tax money that stays its own pool
  // after the access age and is taxed as income on the way out (`incomeTax` is the yearly
  // income tax on a gross amount), and `startRoth` is a Roth pool that comes out tax free.
  // When unset, the 401k (Roth included) joins savings untaxed at the access age. 401k
  // money from pay periods and money-in events for the retirement account goes into the
  // pre-tax pool.
  incomeTax?: (gross: number) => number
  startRoth?: number
}
