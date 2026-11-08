import { applyData } from '@/shared/utils/applyData'
import { nextStatementDay } from './nextStatementDay'

describe('nextStatementDay', () => {
  afterEach(() => applyData({}))

  it('is null with no periods for the account', () => {
    applyData({ periods: { a: { account: 'cc', start: '2026-09-05', end: '2026-10-04' } } })
    expect(nextStatementDay('chk')).toBeNull()
  })
  it('is exact when every closing day agrees', () => {
    applyData({
      periods: {
        a: { account: 'chk', start: '2026-08-12', end: '2026-09-11' },
        b: { account: 'chk', start: '2026-09-12', end: '2026-10-11' },
      },
    })
    expect(nextStatementDay('chk')).toEqual({ day: 11, approx: false })
  })
  it('is approximate and uses the latest day when it drifted', () => {
    applyData({
      periods: {
        a: { account: 'chk', start: '2026-08-12', end: '2026-09-11' },
        b: { account: 'chk', start: '2026-09-12', end: '2026-10-13' },
      },
    })
    expect(nextStatementDay('chk')).toEqual({ day: 13, approx: true })
  })
  it('sorts by end date, not insertion order', () => {
    applyData({
      periods: {
        b: { account: 'chk', start: '2026-09-12', end: '2026-10-13' },
        a: { account: 'chk', start: '2026-08-12', end: '2026-09-11' },
      },
    })
    expect(nextStatementDay('chk')?.day).toBe(13)
  })
  it('works with a single period', () => {
    applyData({ periods: { a: { account: 'cc', start: '2026-09-05', end: '2026-10-04' } } })
    expect(nextStatementDay('cc')).toEqual({ day: 4, approx: false })
  })
})
