import { FED_BY_FILING } from '@/shared/constants/FED_BY_FILING'
import { LTCG_BY_FILING } from '@/shared/constants/LTCG_BY_FILING'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import { taxOn } from '@/shared/utils/taxOn'

// rough tax rate on investment gains in a regular (not 401k) account, for someone
// living on `income` a year: federal long-term capital gains bracket plus the state's
// effective income tax rate, since most states tax gains as ordinary income. The federal
// brackets are for taxable income, so the standard deduction comes off first.
export function gainsTaxPct(income: number, taxState: string, filing: FilingStatus = FilingStatus.single): number {
  const lt = LTCG_BY_FILING[filing] ?? LTCG_BY_FILING.single
  const taxable = Math.max(0, income - (FED_BY_FILING[filing] ?? FED_BY_FILING.single).standardDeduction)
  const fed = taxable <= lt.zeroTo ? 0 : taxable <= lt.fifteenTo ? 0.15 : 0.2
  const t = taxOn(income, taxState, filing)
  const st = income > 0 ? (t.state + t.local) / income : 0
  return Math.round((fed + st) * 1000) / 10
}
