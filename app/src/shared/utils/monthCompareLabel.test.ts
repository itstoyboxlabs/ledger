import { applyData } from '@/shared/utils/applyData'
import { monthCompareLabel } from './monthCompareLabel'

describe('monthCompareLabel', () => {
  afterEach(() => applyData({}))

  it('is the plain label for a fully covered month', () => {
    applyData({
      accounts: { chk: { name: 'Checking' } },
      periods: { a: { account: 'chk', start: '2026-09-01', end: '2026-10-31' } },
    })
    expect(monthCompareLabel('2026-10')).toBe('Oct 2026')
  })
  it('marks a partially covered month', () => {
    applyData({
      accounts: { chk: { name: 'Checking' } },
      periods: { a: { account: 'chk', start: '2026-09-01', end: '2026-10-13' } },
    })
    expect(monthCompareLabel('2026-10')).toBe('Oct 2026 · partial')
  })
  it('marks months with no statements', () => {
    applyData({ accounts: { chk: { name: 'Checking' } } })
    expect(monthCompareLabel('2026-01')).toBe('Jan 2026 · partial')
  })
})
