import type { PoolDraw } from '@/screens/retirement/types/PoolDraw'
import { grossUp } from '@/screens/retirement/utils/grossUp'

// Cover `need` (after tax) once regular savings are used up: the pre-tax pool first, taking
// out enough extra to pay the income tax on it, then the Roth pool, which owes nothing.
// Roth goes last because it grows tax free the longest.
export function drawFromPools(need: number, pretax: number, roth: number, tax: (gross: number) => number): PoolDraw {
  if (need <= 0) return { pretax: 0, roth: 0, tax: 0, short: 0 }
  const allTax = pretax > 0 ? tax(pretax) : 0
  if (pretax > 0 && pretax - allTax >= need) {
    const g = grossUp(need, tax, pretax)
    return { pretax: g, roth: 0, tax: g - need, short: 0 }
  }
  const rest = need - (pretax > 0 ? pretax - allTax : 0)
  const fromRoth = Math.min(Math.max(0, roth), rest)
  return { pretax: Math.max(0, pretax), roth: fromRoth, tax: allTax, short: fromRoth >= rest ? 0 : rest - fromRoth }
}
