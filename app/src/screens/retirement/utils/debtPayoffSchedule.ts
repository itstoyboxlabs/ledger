import type { DebtSchedule } from '@/screens/retirement/types/DebtSchedule'
import { payoffMonths } from '@/shared/utils/payoffMonths'

// When a debt paid at its own monthly payment clears, with interest at its APR: the months to
// zero come from payoffMonths, the same math as the Debt payoff tool. With no APR that is balance
// divided by payment, rounded up, as before. The payoff year frees only the months left after the
// last payment; every later year frees all 12. A payment that never covers the interest (or no
// payment at all) never clears, so it frees nothing.
export function debtPayoffSchedule(balance: number, monthlyPayment: number, apr: number, startAge: number): DebtSchedule {
  if (balance <= 0) return { payoffAge: startAge - 1, freedMonthsInPayoffYear: 12 } // already clear
  const months = payoffMonths(balance, monthlyPayment, apr)
  if (months === null) return { payoffAge: Infinity, freedMonthsInPayoffYear: 0 } // never clears
  const yearIndex = Math.floor((months - 1) / 12)
  const monthWithinYear = months - yearIndex * 12
  return { payoffAge: startAge + yearIndex, freedMonthsInPayoffYear: 12 - monthWithinYear }
}
