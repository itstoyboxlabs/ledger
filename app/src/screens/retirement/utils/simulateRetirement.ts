import type { RetirePhase } from '@/screens/retirement/types/RetirePhase'
import type { RetireSimInput } from '@/screens/retirement/types/RetireSimInput'
import type { RetireSimResult } from '@/screens/retirement/types/RetireSimResult'
import type { RetireSimRow } from '@/screens/retirement/types/RetireSimRow'
import { eventAmountAt } from '@/screens/retirement/utils/eventAmountAt'
import { payAt } from '@/screens/retirement/utils/payAt'
import { ssFromEarnings } from '@/screens/retirement/utils/ssFromEarnings'
import { SS_CAREER_START_AGE } from '@/screens/retirement/constants/SS_CAREER_START_AGE'

// The year-by-year projection from the current age to the end age, for one retire age.
// The 401k is locked until the access age. From then on it is part of savings: whatever
// it holds moves in at the end of the access year (shown in Contributions, so each row
// still adds up), and new 401k money goes straight to savings. Already past the access
// age, it starts in savings.
//
// With a pay plan, each working year takes its pay, 401k and savings from the period
// that covers it. A year no period covers keeps today's numbers. The 401k's first year
// at a new period is 75%, like the first year today. Auto savings start from the Budget
// and move with take-home pay, measured against the period that covers today. Pay from a
// period that runs past the retire age lowers the withdrawal, and any extra is saved.
// With Social Security on Auto, the benefit comes from the plan's earnings.
export function simulateRetirement(c: RetireSimInput, retireAge: number): RetireSimResult {
  const rows: RetireSimRow[] = []
  const pay = c.pay && c.pay.periods.length > 0 ? c.pay : null
  const at = (age: number) => (pay ? payAt(pay.periods, age, c.age, retireAge, pay.planRetireAge) : null)
  const now = at(c.age)
  const baseNet = !pay ? 0 : now ? pay.math(now.gross, pay.periods[now.index].k401).net : pay.math(pay.todaySalary, 'auto').net
  let ssMonthly = c.ssMonthly
  if (pay?.ssFromPlan) {
    // years before today count at today's pay, a working year no period covers too
    const earnings: number[] = Array(Math.max(0, c.age - SS_CAREER_START_AGE)).fill(now ? now.gross : pay.todaySalary)
    for (let age = c.age; age < Math.min(c.ssClaimAge, c.endAge + 1); age++) {
      earnings.push(at(age)?.gross ?? (age < retireAge ? pay.todaySalary : 0))
    }
    ssMonthly = ssFromEarnings(earnings, c.ssClaimAge)
  }
  // which period paid last year (-1: today's numbers), for the 401k's first-year rule
  let prevSeg: number | null = null
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
    // Social Security covers part of the monthly need from the claim age on
    const ssNow = age >= c.ssClaimAge ? ssMonthly : 0
    let contribK: number
    let contribS: number
    let withdrawal: number
    let gross: number
    if (!pay) {
      // first year: 401k eligibility starts 3 months into employment -> 9/12 of the contribution
      contribK = working ? (age === c.age ? c.base401k * 0.75 : c.base401k) + c.extras401k : 0
      contribS = working ? c.contribSavings + c.freed(age) : 0
      withdrawal = working ? 0 : Math.max(0, c.withdrawMo - ssNow) * 12
      gross = working ? c.salary ?? 0 : 0
    } else {
      const hit = at(age)
      const seg = hit ? hit.index : working ? -1 : null
      const first = seg !== null && seg !== prevSeg
      prevSeg = seg
      const period = hit ? pay.periods[hit.index] : null
      const m = hit && period ? pay.math(hit.gross, period.k401) : null
      const k401 = m ? (m.own + m.match) * (first ? 0.75 : 1) : 0
      if (working) {
        if (!m || !period) {
          contribK = (first ? c.base401k * 0.75 : c.base401k) + c.extras401k
          contribS = c.contribSavings + c.freed(age)
          gross = pay.todaySalary
        } else {
          contribK = k401 + c.extras401k
          const saving = period.savings === 'auto' ? pay.budgetSavings + m.net - baseNet : period.savings
          contribS = saving + pay.extrasSavings + c.freed(age)
          gross = hit?.gross ?? 0
        }
        withdrawal = 0
      } else {
        // work after retiring: take-home pay covers the need first, the rest is saved
        const need = Math.max(0, c.withdrawMo - ssNow) * 12
        const net = m?.net ?? 0
        contribK = k401
        contribS = Math.max(0, net - need)
        withdrawal = Math.max(0, need - net)
        gross = hit?.gross ?? 0
      }
    }
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
    rows.push({ age, phase, pay: gross, k, s, contrib: contribK + contribS + moneyIn + moved, growth: sGrowth, withdrawal: withdrawal + moneyOut, total: s })
    if (age === retireAge - 1) atRetirement = { liquid: s, locked: k }
    if (runOutAge === null && !working && s < 0) runOutAge = age
  }
  return { rows, runOutAge, atRetirement, ssMonthly }
}
