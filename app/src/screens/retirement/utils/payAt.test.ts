import { payAt } from './payAt'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

const p = (o: Partial<PayPeriod>): PayPeriod => ({
  id: 'p', label: '', fromAge: 30, toAge: 'retire', salary: 100000, raisePct: 0, k401: 'auto', savings: 'auto', ...o,
})

describe('payAt', () => {
  it('covers from the from age up to the retire age', () => {
    const plan = [p({})]
    expect(payAt(plan, 30, 30, 60, 60)).toEqual({ gross: 100000, index: 0 })
    expect(payAt(plan, 59, 30, 60, 60)?.gross).toBe(100000)
    expect(payAt(plan, 60, 30, 60, 60)).toBeNull()
    expect(payAt(plan, 29, 25, 60, 60)).toBeNull()
  })

  it('compounds a raise from the year the period starts', () => {
    const plan = [p({ raisePct: 3 })]
    expect(payAt(plan, 40, 30, 60, 60)?.gross).toBeCloseTo(100000 * 1.03 ** 10, 6)
  })

  it('counts a period that starts before today from today', () => {
    const plan = [p({ fromAge: 20, raisePct: 10 })]
    expect(payAt(plan, 30, 30, 60, 60)?.gross).toBe(100000)
  })

  it('ends a numbered period at its until age', () => {
    const plan = [p({ toAge: 45 }), p({ id: 'b', fromAge: 45, salary: 60000 })]
    expect(payAt(plan, 44, 30, 60, 60)?.index).toBe(0)
    expect(payAt(plan, 45, 30, 60, 60)).toEqual({ gross: 60000, index: 1 })
  })

  it('lets the later row win where two overlap', () => {
    const plan = [p({}), p({ id: 'b', fromAge: 40, salary: 50000 })]
    expect(payAt(plan, 39, 30, 60, 60)?.index).toBe(0)
    expect(payAt(plan, 40, 30, 60, 60)?.index).toBe(1)
  })

  it('keeps a period past the plan retire age going after retiring', () => {
    const plan = [p({ toAge: 60 }), p({ id: 'part', fromAge: 60, toAge: 66, salary: 30000 })]
    expect(payAt(plan, 62, 30, 60, 60)).toEqual({ gross: 30000, index: 1 })
    expect(payAt(plan, 66, 30, 60, 60)).toBeNull()
  })

  it('stops a career period at an earlier retire age being tried', () => {
    const plan = [p({ toAge: 45 }), p({ id: 'b', fromAge: 45 })]
    // trying 42: the job that ends at 45 is not work after retiring
    expect(payAt(plan, 43, 30, 42, 60)).toBeNull()
    expect(payAt(plan, 50, 30, 42, 60)).toBeNull()
  })

  it('treats a negative salary as no pay', () => {
    expect(payAt([p({ salary: -5 })], 31, 30, 60, 60)?.gross).toBe(0)
  })
})
