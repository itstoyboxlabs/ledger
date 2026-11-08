import { payPlanIssues } from './payPlanIssues'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

type P = Pick<PayPeriod, 'id' | 'fromAge' | 'toAge'> & { missingPay?: boolean; missingSave?: boolean }
const p = (o: Partial<P>): P => ({ id: 'a', fromAge: 35, toAge: 'retire', ...o })
const texts = (ps: P[]) => payPlanIssues(ps, 35, 60, 95).map((x) => `${x.id ?? '-'} ${x.tone} ${x.text}`)

describe('payPlanIssues', () => {
  it('says nothing for no plan or a clean plan', () => {
    expect(texts([])).toEqual([])
    expect(texts([p({ toAge: 45 }), p({ id: 'b', fromAge: 45 })])).toEqual([])
  })
  it('flags a gap between periods', () => {
    expect(texts([p({ toAge: 40 }), p({ id: 'b', fromAge: 45 })])).toEqual([
      "- warn No period covers ages 40 to 44. Those years use today's 401k and saving.",
    ])
  })
  it('flags a single year gap at the start', () => {
    expect(texts([p({ fromAge: 36 })])).toEqual(["- warn No period covers age 35. Those years use today's 401k and saving."])
  })
  it('explains a period past the retire age and flags one that never counts', () => {
    expect(texts([p({ toAge: 60 }), p({ id: 'b', fromAge: 60, toAge: 66 })])).toEqual([
      'b info Keeps going after you retire at 60. What it saves is added while you take money out.',
    ])
    expect(texts([p({ toAge: 60 }), p({ id: 'b', fromAge: 62 })])).toContain(
      'b warn Starts after you retire at 60, so it never counts. Set an until age to keep saving.',
    )
  })
  it('notes a start before today', () => {
    expect(texts([p({ fromAge: 30 })])).toEqual(['a info Starts before today, so it counts from 35.'])
  })
  it('says when a preset was deleted', () => {
    expect(texts([p({ missingPay: true, missingSave: true })])).toEqual([
      'a warn Its Take-home preset was deleted, so it uses the typed 401k.',
      'a warn Its Budget preset was deleted, so it uses the typed saving.',
    ])
  })
})
