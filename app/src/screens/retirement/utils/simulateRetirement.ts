import type { RetirePhase } from '@/screens/retirement/types/RetirePhase'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import type { RetireSimResult } from '@/screens/retirement/types/RetireSimResult'
import type { RetireSimRow } from '@/screens/retirement/types/RetireSimRow'
import { drawFromPools } from '@/screens/retirement/utils/drawFromPools'
import { eventAmountAt } from '@/screens/retirement/utils/eventAmountAt'

// The year-by-year projection from the current age to the end age, for one retire age.
// The 401k is locked until the access age. From then on it is part of savings: whatever
// it holds moves in at the end of the access year (shown in Contributions, so each row
// still adds up), and new 401k money goes straight to savings. Already past the access
// age, it starts in savings.
// With `incomeTax` set the 401k instead stays its own pre-tax pool (plus a Roth pool) once
// it opens. It counts in the liquid total from then on, regular savings are spent first,
// and only a shortfall is drawn from it, grossed up for income tax (see drawFromPools).
export function simulateRetirement(c: RetireSimInput, retireAge: number): RetireSimResult {
  const rows: RetireSimRow[] = []
  const taxed = !!c.incomeTax
  const openAtStart = c.age >= c.accessAge
  const merge = openAtStart && !taxed
  let k = merge ? 0 : c.start401k
  let roth = taxed ? c.startRoth ?? 0 : 0
  let s = c.startSavings + (merge ? c.start401k : 0)
  // taxed only: the retirement pools are open and count in the liquid total
  let unlocked = taxed && openAtStart
  const liquid = () => s + (unlocked ? k + roth : 0)
  const locked = () => (unlocked ? 0 : k + roth)
  let runOutAge: number | null = null
  // retiring now: nothing more is saved, so what you start with is what you retire with
  let atRetirement: RetireSimResult['atRetirement'] = retireAge <= c.age ? { liquid: liquid(), locked: locked() } : null
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
    const rothGrowth = roth > 0 ? roth * rate : 0
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
    const wasUnlocked = unlocked
    let moved = 0
    if (taxed && open && !unlocked) {
      moved = k + kGrowth + roth + rothGrowth
      unlocked = true
    }
    const toSavings = open && !taxed
    k += kGrowth + (toSavings ? 0 : contribK)
    roth += rothGrowth
    s += sGrowth + contribS + (toSavings ? contribK : 0) + moneyIn - withdrawal - moneyOut
    if (toSavings && k > 0) {
      moved = k
      s += k
      k = 0
    }
    let tax = 0
    if (unlocked && s < 0) {
      const d = drawFromPools(-s, k, roth, c.incomeTax!)
      k -= d.pretax
      roth -= d.roth
      tax = d.tax
      s = d.short > 0 ? -d.short : 0
    }
    const phase: RetirePhase = working ? 'working' : open ? 'retired' : 'early-retired'
    // Total and Growth are the LIQUID pool only; the 401k's growth shows in its own column
    // until it opens
    const growth = sGrowth + (wasUnlocked ? kGrowth + rothGrowth : 0)
    rows.push({ age, phase, k: locked(), s, contrib: contribK + contribS + moneyIn + moved, growth, withdrawal: withdrawal + moneyOut, total: liquid(), tax })
    if (age === retireAge - 1) atRetirement = { liquid: liquid(), locked: locked() }
    if (runOutAge === null && !working && s < 0) runOutAge = age
  }
  return { rows, runOutAge, atRetirement }
}
