import { getLastCompleteMonth } from '@/shared/utils/getLastCompleteMonth'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import { monthlyCost } from '@/shared/utils/monthlyCost'
import { actualForBudgetRow } from '@/shared/utils/actualForBudgetRow'
import type { BudgetRowLike } from '@/shared/types/BudgetRowLike'

// The rows the Budget page shows, from a budget file's rows and `dismissedSubs`.
//
// Subscriptions are not hand-maintained. Their budgeted amount IS the real latest
// observed charge from the statements (`SUBSCRIPTIONS`, refreshed by the monthly
// import), annuals spread to their monthly equivalent — which is why there's no "reset
// to actual" button and no hide/unhide toggle: a subscription you cancelled ages out of
// the list on its own, and one you forgot to add shows up the moment it bills.
//
// Deliberately the LATEST SINGLE CHARGE, not a month's sum: billing dates drift, so a
// calendar month can catch two charges (one month can catch a subscription twice) or none,
// and neither is what the subscription costs per month. The vs-Actual column still
// shows the real month sum — that's the whole point of comparing.
//
// Annual plans are NOT subscriptions for budgeting purposes (a deliberate product decision): a once-a-year
// charge is a one-time payment you save for, not a monthly line item, and spreading it
// to a $22/mo phantom row made the budget look like money was leaving every month when
// it wasn't. They stay in SUBSCRIPTIONS (the Actuals tab still tracks them) but never
// appear here.
export const liveSubAmount = (row: BudgetRowLike): number => {
  const sub = getSubscriptions().find((s) => s.name === row.name)
  if (sub) return Math.round(monthlyCost(sub))
  // one added by hand that the statements haven't seen yet keeps the amount typed in
  const actual = actualForBudgetRow(row, getLastCompleteMonth()) ?? 0
  return Math.round(actual > 0 ? actual : Number(row.amount) || 0)
}
