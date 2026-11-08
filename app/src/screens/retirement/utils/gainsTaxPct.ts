import { taxOn } from '@/shared/utils/taxOn'

// rough tax rate on investment gains in a regular (not 401k) account, for someone
// living on `income` a year: federal long-term capital gains bracket plus the state's
// effective income tax rate, since most states tax gains as ordinary income
export function gainsTaxPct(income: number, taxState: string): number {
  const fed = income <= 49450 ? 0 : income <= 545500 ? 0.15 : 0.2
  const t = taxOn(income, taxState)
  const st = income > 0 ? (t.state + t.local) / income : 0
  return Math.round((fed + st) * 1000) / 10
}
