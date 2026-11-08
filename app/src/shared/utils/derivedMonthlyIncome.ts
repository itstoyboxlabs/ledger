import { getAllTxns } from '@/shared/utils/getAllTxns'

/* ---------- budget ---------- */

// monthly income from actual paychecks: average FULL paycheck × 2 (semi-monthly).
// Checks flagged `partial` (e.g. the short first check after starting May 5) are excluded.
export function derivedMonthlyIncome() {
  const checks = getAllTxns().filter(
    (t) => t.kind === 'income' && t.sub === 'Payroll' && !t.partial,
  )
  if (!checks.length) return 0
  const avgCheck = checks.reduce((s, t) => s + t.amount, 0) / checks.length
  return avgCheck * 2
}
