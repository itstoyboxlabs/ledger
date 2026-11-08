import { applyData } from '@/shared/utils/applyData'
import { isMonthComplete } from './isMonthComplete'

describe('isMonthComplete', () => {
  afterEach(() => applyData({}))

  it('is true when every account covers the whole month', () => {
    applyData({
      accounts: { chk: { name: 'Checking' }, cc: { name: 'Card', type: 'card' } },
      periods: {
        a: { account: 'chk', start: '2026-09-12', end: '2026-11-11' },
        b: { account: 'cc', start: '2026-09-05', end: '2026-11-04' },
      },
    })
    expect(isMonthComplete('2026-10')).toBe(true)
  })
  it('is false when one account has a gap', () => {
    applyData({
      accounts: { chk: { name: 'Checking' }, cc: { name: 'Card', type: 'card' } },
      periods: {
        a: { account: 'chk', start: '2026-09-12', end: '2026-11-11' },
        b: { account: 'cc', start: '2026-10-10', end: '2026-11-04' },
      },
    })
    expect(isMonthComplete('2026-10')).toBe(false)
  })
  it('is false when statements end mid month', () => {
    applyData({
      accounts: { chk: { name: 'Checking' } },
      periods: { a: { account: 'chk', start: '2026-10-01', end: '2026-10-20' } },
    })
    expect(isMonthComplete('2026-10')).toBe(false)
  })
  it('is vacuously true with no accounts', () => {
    applyData({})
    expect(isMonthComplete('2026-10')).toBe(true)
  })
})
