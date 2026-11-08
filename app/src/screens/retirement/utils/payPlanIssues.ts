import type { PayIssue } from '@/screens/retirement/types/PayIssue'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import { payAt } from '@/screens/retirement/utils/payAt'

const span = (a: number, b: number) => (a === b ? `age ${a}` : `ages ${a} to ${b}`)

// Notes on the pay plan, so gaps, overlaps and periods past the retire age are never a
// silent surprise. The projection itself never fails on any of these.
export function payPlanIssues(periods: PayPeriod[], startAge: number, retireAge: number, endAge: number): PayIssue[] {
  if (periods.length === 0) return []
  const out: PayIssue[] = []
  const name = (i: number) => periods[i].label.trim() || `period ${i + 1}`
  const range = (p: PayPeriod) => {
    const from = Math.max(p.fromAge, startAge)
    return { from, end: p.toAge === 'retire' ? retireAge : p.toAge }
  }
  periods.forEach((p, i) => {
    const { from, end } = range(p)
    const warn = (text: string) => out.push({ id: p.id, tone: 'warn', text })
    const info = (text: string) => out.push({ id: p.id, tone: 'info', text })
    if (p.fromAge < startAge) info(`Starts before today, so it counts from ${startAge}.`)
    if (from > endAge) warn('Starts after the plan ends.')
    else if (p.toAge === 'retire' && from >= retireAge) warn(`Starts after you retire at ${retireAge}, so it never pays. Set an until age to keep working.`)
    else if (end <= from) warn(`Ends before it starts. Set an until age after ${from}.`)
    else if (p.toAge !== 'retire' && p.toAge > retireAge) info(`Keeps going after you retire at ${retireAge}. Its pay lowers what you take out.`)
    if (!(p.salary > 0)) info('No pay. These years count as time off.')
    for (let j = i + 1; j < periods.length; j++) {
      const o = range(periods[j])
      const a = Math.max(from, o.from)
      const b = Math.min(end, o.end) - 1
      if (a <= b) warn(`Overlaps ${name(j)} at ${span(a, b)}. The lower one wins there.`)
    }
  })
  // working years no period covers keep today's pay and saving
  let gapFrom: number | null = null
  for (let age = startAge; age <= Math.min(retireAge, endAge + 1); age++) {
    const covered = age < retireAge && age <= endAge && payAt(periods, age, startAge, retireAge, retireAge) !== null
    if (!covered && age < retireAge && age <= endAge) gapFrom ??= age
    else if (gapFrom !== null) {
      out.push({ id: null, tone: 'warn', text: `No period covers ${span(gapFrom, age - 1)}. Those years use today's pay and saving.` })
      gapFrom = null
    }
  }
  return out
}
