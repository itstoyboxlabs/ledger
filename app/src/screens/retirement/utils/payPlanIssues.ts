import type { PayIssue } from '@/screens/retirement/types/PayIssue'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import { periodAt } from '@/screens/retirement/utils/periodAt'

const span = (a: number, b: number) => (a === b ? `age ${a}` : `ages ${a} to ${b}`)

// A period as the notes need it; the missing flags say its preset was deleted.
type IssuePeriod = Pick<PayPeriod, 'id' | 'fromAge' | 'toAge'> & { missingPay?: boolean; missingSave?: boolean }

// Notes on the pay plan, so gaps, deleted presets and periods past the retire age are
// never a silent surprise. Periods never overlap (see tidyPayPeriods). The projection
// itself never fails on any of these.
export function payPlanIssues(periods: IssuePeriod[], startAge: number, retireAge: number, endAge: number): PayIssue[] {
  if (periods.length === 0) return []
  const out: PayIssue[] = []
  periods.forEach((p) => {
    const from = Math.max(p.fromAge, startAge)
    const warn = (text: string) => out.push({ id: p.id, tone: 'warn', text })
    const info = (text: string) => out.push({ id: p.id, tone: 'info', text })
    if (p.fromAge < startAge) info(`Starts before today, so it counts from ${startAge}.`)
    if (from > endAge) warn('Starts after the plan ends.')
    else if (p.toAge === 'retire' && from >= retireAge) warn(`Starts after you retire at ${retireAge}, so it never counts. Set an until age to keep saving.`)
    else if (p.toAge !== 'retire' && p.toAge > retireAge) info(`Keeps going after you retire at ${retireAge}. What it saves is added while you take money out.`)
    if (p.missingPay) warn('Its Take-home preset was deleted, so it uses the typed 401k.')
    if (p.missingSave) warn('Its Budget preset was deleted, so it uses the typed saving.')
  })
  // working years no period covers keep today's 401k and saving
  let gapFrom: number | null = null
  for (let age = startAge; age <= Math.min(retireAge, endAge + 1); age++) {
    const covered = age < retireAge && age <= endAge && periodAt(periods, age, startAge, retireAge, retireAge) !== null
    if (!covered && age < retireAge && age <= endAge) gapFrom ??= age
    else if (gapFrom !== null) {
      out.push({ id: null, tone: 'warn', text: `No period covers ${span(gapFrom, age - 1)}. Those years use today's 401k and saving.` })
      gapFrom = null
    }
  }
  return out
}
