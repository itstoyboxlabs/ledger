import { applyData } from '@/shared/utils/applyData'
import { coverage } from './coverage'
import type { Periods } from '@/shared/types/Periods'

const load = (periods: Periods) =>
  applyData({ accounts: { chk: { name: 'Checking' }, cc: { name: 'Card', type: 'card' } }, periods })

describe('coverage', () => {
  afterEach(() => applyData({}))

  it('reports all missing when the account has no periods', () => {
    load({})
    expect(coverage('2026-10', 'chk')).toEqual({ full: false, missing: 'all' })
  })
  it('is full when one period spans the whole month', () => {
    load({ a: { account: 'chk', start: '2026-09-20', end: '2026-11-05' } })
    expect(coverage('2026-10', 'chk')).toEqual({ full: true, ranges: [['2026-10-01', '2026-10-31']] })
  })
  it('clips a partial period to the month', () => {
    load({ a: { account: 'chk', start: '2026-10-10', end: '2026-11-09' } })
    expect(coverage('2026-10', 'chk')).toEqual({ full: false, ranges: [['2026-10-10', '2026-10-31']] })
  })
  it('merges contiguous periods into a full month', () => {
    load({
      a: { account: 'chk', start: '2026-09-25', end: '2026-10-14' },
      b: { account: 'chk', start: '2026-10-15', end: '2026-11-14' },
    })
    expect(coverage('2026-10', 'chk').full).toBe(true)
  })
  it('keeps a gap as separate ranges', () => {
    load({
      a: { account: 'chk', start: '2026-10-01', end: '2026-10-10' },
      b: { account: 'chk', start: '2026-10-20', end: '2026-10-31' },
    })
    const got = coverage('2026-10', 'chk')
    expect(got.full).toBe(false)
    expect(got.ranges).toEqual([['2026-10-01', '2026-10-10'], ['2026-10-20', '2026-10-31']])
  })
  it('ignores other accounts and handles February in a leap year', () => {
    load({
      a: { account: 'cc', start: '2028-02-01', end: '2028-02-29' },
      b: { account: 'chk', start: '2028-02-01', end: '2028-02-28' },
    })
    expect(coverage('2028-02', 'cc').full).toBe(true)
    expect(coverage('2028-02', 'chk').full).toBe(false)
  })
})
