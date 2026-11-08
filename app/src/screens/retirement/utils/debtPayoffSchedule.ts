import type { DebtSchedule } from '@/screens/retirement/types/DebtSchedule'

// When a debt paid at its own monthly payment clears, ignoring interest (the same simplification
// as the Debt payoff tool): balance divided by payment is the months to zero. The payoff year
// frees only the months left after the last payment; every later year frees all 12.
export function debtPayoffSchedule(balance: number, monthlyPayment: number, startAge: number): DebtSchedule {
  if (balance <= 0) return { payoffAge: startAge - 1, freedMonthsInPayoffYear: 12 } // already clear
  if (monthlyPayment <= 0) return { payoffAge: Infinity, freedMonthsInPayoffYear: 0 } // never clears at $0 a month
  const months = Math.ceil(balance / monthlyPayment)
  const yearIndex = Math.floor((months - 1) / 12)
  const monthWithinYear = months - yearIndex * 12
  return { payoffAge: startAge + yearIndex, freedMonthsInPayoffYear: 12 - monthWithinYear }
}
