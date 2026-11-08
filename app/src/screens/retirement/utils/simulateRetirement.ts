import type { RetirePhase } from '@/screens/retirement/types/RetirePhase'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import type { RetireSimResult } from '@/screens/retirement/types/RetireSimResult'
import type { RetireSimRow } from '@/screens/retirement/types/RetireSimRow'
import { eventAmountAt } from '@/screens/retirement/utils/eventAmountAt'

// The year-by-year projection from the current age to the end age, for one retire age.
// The 401k is locked until the access age. From then on it is part of savings: whatever
// it holds moves in at the end of the access year (shown in Contributions, so each row
// still adds up), and new 401k money goes straight to savings. Already past the access
// age, it starts in savings.
export function simulateRetirement(c: RetireSimInput, retireAge: number): RetireSimResult {
  const rows: RetireSimRow[] = []
  const openAtStart = c.age >= c.accessAge
  let k = openAtStart ? 0 : c.start401k
  let s = c.startSavings + (openAtStart ? c.start401k : 0)
  let runOutAge: number | null = null
  // retiring now: nothing more is saved, so what you start with is what you retire with
  let atRetirement: RetireSimResult['atRetirement'] = retireAge <= c.age ? { liquid: s, locked: k } : null
  for (let age = c.age; age <= c.endAge; age++) {
    const working = age < retireAge
    const open = age >= c.accessAge
    const rate = working ? c.r : c.rAfter
    // first year: 401k eligibility starts 3 months into employment -> 9/12 of the contribution
    const contribK = working ? (age === c.age ? c.base401k * 0.75 : c.base401k) + c.extras401k : 0
    const contribS = working ? c.contribSavings + c.freed(age) : 0
    // Social Security covers part of the monthly need from the claim age on
    const ssNow = age >= c.ssClaimAge ? c.ssMonthly : 0
    const withdrawal = working ? 0 : Math.max(0, c.withdrawMo - ssNow) * 12
    const kGrowth = k > 0 ? k * rate : 0
    const sGrowth = s > 0 ? s * rate * (1 - c.taxPct / 100) : 0
    // an event linked to the Equity payout tool is treated like RSUs: it only vests while
    // you still work
    let moneyIn = 0
    let moneyOut = 0
    for (const e of c.events) {
      if (e.auto === 'equity' && !working) continue
      const v = eventAmountAt(e, age, Number(e.amount) || 0, Math.max(1, Number(e.years) || 1))
      if (e.kind === 'in') moneyIn += v
      else moneyOut += v
    }
    k += kGrowth + (open ? 0 : contribK)
    s += sGrowth + contribS + (open ? contribK : 0) + moneyIn - withdrawal - moneyOut
    let moved = 0
    if (open && k > 0) {
      moved = k
      s += k
      k = 0
    }
    const phase: RetirePhase = working ? 'working' : open ? 'retired' : 'early-retired'
    // Total and Growth are the LIQUID pool only; the 401k's growth shows in its own column
    rows.push({ age, phase, k, s, contrib: contribK + contribS + moneyIn + moved, growth: sGrowth, withdrawal: withdrawal + moneyOut, total: s })
    if (age === retireAge - 1) atRetirement = { liquid: s, locked: k }
    if (runOutAge === null && !working && s < 0) runOutAge = age
  }
  return { rows, runOutAge, atRetirement }
}
