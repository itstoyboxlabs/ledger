import type { DebtSchedule } from '@/screens/retirement/types/DebtSchedule'

// The payment a paid-off debt frees up in the year you are `age`: nothing before it clears, the
// freed months in its payoff year, and a full year of payments after that.
export function freedFromDebt(sched: DebtSchedule, monthlyPayment: number, age: number): number {
  if (monthlyPayment <= 0 || age < sched.payoffAge) return 0
  return age === sched.payoffAge ? monthlyPayment * sched.freedMonthsInPayoffYear : monthlyPayment * 12
}
