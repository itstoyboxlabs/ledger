import { addPayPeriod } from './addPayPeriod'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

const today = { salary: 90000, k401: 'auto' as const, savings: 'auto' as const }
const strip = (ps: PayPeriod[]) => ps.map(({ id: _id, ...rest }) => rest)

describe('addPayPeriod', () => {
  it('starts an empty plan with Now and one change ten years on', () => {
    expect(strip(addPayPeriod([], 35, 60, today))).toEqual([
      { label: 'Now', fromAge: 35, toAge: 45, salary: 90000, raisePct: 0, k401: 'auto', savings: 'auto' },
      { label: '', fromAge: 45, toAge: 'retire', salary: 90000, raisePct: 0, k401: 'auto', savings: 'auto' },
    ])
  })
  it('starts where a numbered last period ends and copies its saving', () => {
    const plan: PayPeriod[] = [{ id: 'a', label: '', fromAge: 35, toAge: 50, salary: 70000, raisePct: 2, k401: 0, savings: 5000 }]
    const out = addPayPeriod(plan, 35, 60, today)
    expect(out[0]).toEqual(plan[0])
    expect(out[1]).toMatchObject({ fromAge: 50, toAge: 'retire', salary: 70000, raisePct: 0, k401: 0, savings: 5000 })
  })
  it('stays before the retire age when close to it', () => {
    const out = addPayPeriod([], 55, 60, today)
    expect(out[1]).toMatchObject({ fromAge: 59, toAge: 'retire' })
    expect(out[0].toAge).toBe(59)
  })
  it('a period after a part time stretch past retiring gets its own until age', () => {
    const plan: PayPeriod[] = [{ id: 'a', label: '', fromAge: 60, toAge: 64, salary: 30000, raisePct: 0, k401: 0, savings: 'auto' }]
    expect(addPayPeriod(plan, 35, 60, today)[1]).toMatchObject({ fromAge: 64, toAge: 69 })
  })
})
