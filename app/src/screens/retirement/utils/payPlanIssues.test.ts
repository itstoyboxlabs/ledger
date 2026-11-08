import { payPlanIssues } from './payPlanIssues'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

const p = (o: Partial<PayPeriod>): PayPeriod => ({
  id: 'a', label: '', fromAge: 35, toAge: 'retire', salary: 90000, raisePct: 0, k401: 'auto', savings: 'auto', ...o,
})
const texts = (ps: PayPeriod[]) => payPlanIssues(ps, 35, 60, 95).map((x) => `${x.id ?? '-'} ${x.tone} ${x.text}`)

describe('payPlanIssues', () => {
  it('says nothing for no plan or a clean plan', () => {
    expect(texts([])).toEqual([])
    expect(texts([p({ toAge: 45 }), p({ id: 'b', fromAge: 45 })])).toEqual([])
  })
  it('flags a gap between periods', () => {
    expect(texts([p({ toAge: 40 }), p({ id: 'b', fromAge: 45 })])).toEqual([
      "- warn No period covers ages 40 to 44. Those years use today's pay and saving.",
    ])
  })
  it('flags a single year gap and one at the start', () => {
    expect(texts([p({ fromAge: 36 })])).toEqual(["- warn No period covers age 35. Those years use today's pay and saving."])
  })
  it('flags an overlap on the earlier period', () => {
    expect(texts([p({ label: 'Now' }), p({ id: 'b', label: 'Easier job', fromAge: 45 })])).toEqual([
      'a warn Overlaps Easier job at ages 45 to 59. The lower one wins there.',
    ])
  })
  it('explains a period past the retire age and flags one that never pays', () => {
    expect(texts([p({ toAge: 60 }), p({ id: 'b', fromAge: 60, toAge: 66, salary: 30000 })])).toEqual([
      'b info Keeps going after you retire at 60. Its pay lowers what you take out.',
    ])
    expect(texts([p({ toAge: 60 }), p({ id: 'b', fromAge: 62 })])).toContain(
      'b warn Starts after you retire at 60, so it never pays. Set an until age to keep working.',
    )
  })
  it('notes zero pay, a start before today and an end before the start', () => {
    const out = texts([p({ fromAge: 30, salary: 0, toAge: 50 }), p({ id: 'b', fromAge: 50, toAge: 50 }), p({ id: 'c', fromAge: 50 })])
    expect(out).toContain('a info Starts before today, so it counts from 35.')
    expect(out).toContain('a info No pay. These years count as time off.')
    expect(out).toContain('b warn Ends before it starts. Set an until age after 50.')
  })
})
