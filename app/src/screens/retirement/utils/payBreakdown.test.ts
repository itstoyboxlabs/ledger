import { payBreakdown } from './payBreakdown'
import { K401_DEFERRAL_LIMIT } from '@/shared/constants/K401_DEFERRAL_LIMIT'
import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

const th = (salary: number, k401 = 4) => ({
  salary,
  deductions: [
    { id: 'd401k', kind: '401k', unit: 'pct', amount: k401, match: 50 },
    { id: 'dmed', kind: 'insurance', unit: 'mo', amount: 150 },
  ],
}) as RawTakeHome

describe('payBreakdown', () => {
  it('runs the Take-home 401k and match at its salary', () => {
    const m = payBreakdown(th(100000), 'tx')
    expect(m).toMatchObject({ own: 4000, match: 2000 })
    expect(m.net).toBeCloseTo(takeHomeBreakdown(th(100000), 'tx').net, 6)
  })
  it('no 401k line means no 401k and no match', () => {
    expect(payBreakdown({ salary: 60000, deductions: [] } as RawTakeHome, 'tx')).toMatchObject({ own: 0, match: 0 })
  })
  it('caps the deferral and the match follows the capped amount', () => {
    expect(payBreakdown(th(500000, 20), 'tx')).toMatchObject({ own: K401_DEFERRAL_LIMIT, match: K401_DEFERRAL_LIMIT / 2 })
  })
  it('no salary gives nothing', () => {
    expect(payBreakdown(th(0), 'tx')).toEqual({ net: 0, own: 0, match: 0 })
  })
})
