import { payBreakdown } from './payBreakdown'
import { K401_DEFERRAL_LIMIT } from '@/shared/constants/K401_DEFERRAL_LIMIT'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

const th = {
  salary: 80000,
  deductions: [
    { id: 'd401k', kind: '401k', unit: 'pct', amount: 4, match: 50 },
    { id: 'dmed', kind: 'insurance', unit: 'mo', amount: 150 },
  ],
} as RawTakeHome

describe('payBreakdown', () => {
  it('Auto uses the Take-home 401k and match at the given pay', () => {
    const m = payBreakdown(th, 'tx', 100000, 'auto')
    expect(m.own).toBe(4000)
    expect(m.match).toBe(2000)
    expect(m.net).toBeCloseTo(takeHomeBreakdown({ ...th, salary: 100000 }, 'tx').net, 6)
  })
  it('a typed percent replaces the 401k and keeps the match', () => {
    const m = payBreakdown(th, 'tx', 100000, 10)
    expect(m.own).toBe(10000)
    expect(m.match).toBe(5000)
  })
  it('zero percent means no 401k and more take-home', () => {
    const none = payBreakdown(th, 'tx', 100000, 0)
    expect(none.own).toBe(0)
    expect(none.match).toBe(0)
    expect(none.net).toBeGreaterThan(payBreakdown(th, 'tx', 100000, 'auto').net)
  })
  it('caps the deferral at the limit and the match follows the capped amount', () => {
    const m = payBreakdown(th, 'tx', 500000, 20)
    expect(m.own).toBe(K401_DEFERRAL_LIMIT)
    expect(m.match).toBe(K401_DEFERRAL_LIMIT / 2)
  })
  it('no pay gives nothing', () => {
    expect(payBreakdown(th, 'tx', 0, 'auto')).toEqual({ net: 0, own: 0, match: 0 })
  })
})
