import { getAllTxns } from '@/shared/utils/getAllTxns'
import { payPeriodsPerYear } from '@/shared/utils/payPeriodsPerYear'

/* ---------- budget ---------- */

// monthly income from actual paychecks: average FULL paycheck times the pay frequency,
// inferred from the gaps between paydays (semi-monthly when there are too few to tell).
// Checks flagged `partial` (e.g. the short first check after starting a job) are excluded.
export function derivedMonthlyIncome() {
  const checks = getAllTxns().filter(
    (t) => t.kind === 'income' && t.sub === 'Payroll' && !t.partial,
  )
  if (!checks.length) return 0
  const avgCheck = checks.reduce((s, t) => s + t.amount, 0) / checks.length
  return (avgCheck * payPeriodsPerYear(checks.map((t) => t.date))) / 12
}
