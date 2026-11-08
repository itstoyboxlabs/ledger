import { addPayPeriod } from './addPayPeriod'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

const today = { takeHomeFrom: 'today', takeHomePreset: '', k401: 3200, saveFrom: 'today', savePreset: '', savings: 0 } as const
const strip = (ps: PayPeriod[]) => ps.map(({ id: _id, ...rest }) => rest)

describe('addPayPeriod', () => {
  it('starts an empty plan with Now and one change ten years on', () => {
    expect(strip(addPayPeriod([], 35, 60, today))).toEqual([
      { label: 'Now', fromAge: 35, toAge: 45, raisePct: 0, ...today },
      { label: '', fromAge: 45, toAge: 'retire', raisePct: 0, ...today },
    ])
  })
  it('starts where a numbered last period ends and copies its sources', () => {
    const plan: PayPeriod[] = [{ id: 'a', label: '', fromAge: 35, toAge: 50, raisePct: 2, takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: 0, saveFrom: 'typed', savePreset: '', savings: 5000 }]
    const out = addPayPeriod(plan, 35, 60, today)
    expect(out[0]).toEqual(plan[0])
    expect(out[1]).toMatchObject({ fromAge: 50, toAge: 'retire', raisePct: 0, takeHomeFrom: 'preset', takeHomePreset: 'th1', saveFrom: 'typed', savings: 5000 })
  })
  it('stays before the retire age when close to it', () => {
    const out = addPayPeriod([], 55, 60, today)
    expect(out[1]).toMatchObject({ fromAge: 59, toAge: 'retire' })
    expect(out[0].toAge).toBe(59)
  })
  it('a period after a part time stretch past retiring gets its own until age', () => {
    const plan: PayPeriod[] = [{ ...today, id: 'a', label: '', fromAge: 60, toAge: 64, raisePct: 0 }]
    expect(addPayPeriod(plan, 35, 60, today)[1]).toMatchObject({ fromAge: 64, toAge: 69 })
  })
})
