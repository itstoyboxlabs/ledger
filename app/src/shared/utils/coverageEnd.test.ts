import { applyData } from '@/shared/utils/applyData'
import { coverageEnd } from './coverageEnd'

describe('coverageEnd', () => {
  afterEach(() => applyData({}))

  it('returns the latest end date for the account', () => {
    applyData({
      periods: {
        a: { account: 'chk', start: '2026-08-12', end: '2026-09-11' },
        b: { account: 'chk', start: '2026-09-12', end: '2026-10-13' },
        c: { account: 'chk', start: '2026-06-12', end: '2026-07-11' },
      },
    })
    expect(coverageEnd('chk')).toBe('2026-10-13')
  })
  it('only looks at the given account', () => {
    applyData({
      periods: {
        a: { account: 'chk', start: '2026-09-12', end: '2026-10-13' },
        b: { account: 'cc', start: '2026-09-05', end: '2026-10-04' },
      },
    })
    expect(coverageEnd('cc')).toBe('2026-10-04')
  })
  it('is undefined with no periods', () => {
    applyData({})
    expect(coverageEnd('chk')).toBeUndefined()
  })
})
