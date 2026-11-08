import { getPeriods } from '@/shared/utils/getPeriods'
import type { StatementDay } from '@/shared/types/StatementDay'

// Expected statement-closing day-of-month for an account, derived from the real
// statement periods on file (not guessed). If every observed closing day agrees,
// returns it exact; if they've drifted, returns the most recent one flagged
// `approx` (the checking account's cycle has moved 11th -> 13th, e.g.).
export function nextStatementDay(account: string): StatementDay | null {
  const periods = Object.values(getPeriods())
    .filter((p) => p.account === account)
    .sort((a, b) => a.end.localeCompare(b.end))
  if (!periods.length) return null
  const days = periods.map((p) => Number(p.end.slice(8, 10)))
  const latest = days[days.length - 1]
  const approx = new Set(days).size > 1
  return { day: latest, approx }
}
