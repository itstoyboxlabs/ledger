import { periodAt } from './periodAt'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

type Span = Pick<PayPeriod, 'fromAge' | 'toAge'>
const p = (fromAge: number, toAge: Span['toAge']): Span => ({ fromAge, toAge })

describe('periodAt', () => {
  it('covers from the from age up to, not including, the retire age', () => {
    const plan = [p(30, 'retire')]
    expect(periodAt(plan, 30, 30, 60, 60)).toEqual({ index: 0, year: 0 })
    expect(periodAt(plan, 59, 30, 60, 60)).toEqual({ index: 0, year: 29 })
    expect(periodAt(plan, 60, 30, 60, 60)).toBeNull()
    expect(periodAt(plan, 29, 25, 60, 60)).toBeNull()
  })
  it('until 45 is done at 45 and the next period picks up at 45', () => {
    const plan = [p(30, 45), p(45, 'retire')]
    expect(periodAt(plan, 44, 30, 60, 60)?.index).toBe(0)
    expect(periodAt(plan, 45, 30, 60, 60)).toEqual({ index: 1, year: 0 })
  })
  it('counts a period that starts before today from today', () => {
    expect(periodAt([p(20, 'retire')], 31, 30, 60, 60)).toEqual({ index: 0, year: 1 })
  })
  it('keeps a period past the plan retire age going after retiring', () => {
    const plan = [p(30, 60), p(60, 66)]
    expect(periodAt(plan, 62, 30, 60, 60)).toEqual({ index: 1, year: 2 })
    expect(periodAt(plan, 66, 30, 60, 60)).toBeNull()
  })
  it('stops a career period at an earlier retire age being tried', () => {
    const plan = [p(30, 45), p(45, 'retire')]
    expect(periodAt(plan, 43, 30, 42, 60)).toBeNull()
    expect(periodAt(plan, 50, 30, 42, 60)).toBeNull()
  })
})
