import { fmt } from '@/shared/utils/fmt'
import { fmt0 } from '@/shared/utils/fmt0'
import { formatMonthsLong } from '@/shared/utils/formatMonthsLong'
import { payoffAge } from '@/shared/utils/payoffAge'
import { payoffMonths } from '@/shared/utils/payoffMonths'

// One plain sentence on when a debt is paid off and what that frees up, the same on Balances and
// Retirement. Months come from payoffMonths, so interest is included. `age` is your age now for
// planning, or null when it is not known (then no age is shown).
export function debtPayoffLine(balance: number, apr: number, payment: number, age: number | null): string {
  if (balance <= 0) return 'This debt is already paid off.'
  if (!(payment > 0)) return 'Add a monthly payment to see when this debt is paid off.'
  const months = payoffMonths(balance, payment, apr)
  if (months === null) return 'Your payment does not cover the interest, so this debt is never paid off at this payment.'
  const when = age === null ? '' : ` (age ${payoffAge(age, months)})`
  const amount = Number.isInteger(payment) ? fmt0(payment) : fmt(payment)
  return `Paid off in ${formatMonthsLong(months)}${when}. Then ${amount} a month is freed up.`
}
