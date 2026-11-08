import { monthlyCost } from './monthlyCost'
import type { Subscription } from '@/shared/types/Subscription'

describe('monthlyCost', () => {
  it('returns the amount for monthly subscriptions', () => {
    expect(monthlyCost({ cadence: 'monthly', amount: 15.49 })).toBe(15.49)
  })
  it('divides annual subscriptions by 12', () => {
    expect(monthlyCost({ cadence: 'annual', amount: 120 })).toBe(10)
    expect(monthlyCost({ cadence: 'annual', amount: 100 })).toBeCloseTo(8.3333, 4)
  })
  it('converts weekly subscriptions to 52 weeks over 12 months', () => {
    expect(monthlyCost({ cadence: 'weekly', amount: 12 })).toBe(52)
    expect(monthlyCost({ cadence: 'weekly', amount: 10 })).toBeCloseTo(43.3333, 4)
  })
  it('handles zero', () => {
    expect(monthlyCost({ cadence: 'annual', amount: 0 })).toBe(0)
    expect(monthlyCost({ cadence: 'monthly', amount: 0 })).toBe(0)
  })
  it('treats unknown cadence as monthly', () => {
    expect(monthlyCost({ amount: 9 } as Subscription)).toBe(9)
  })
})
