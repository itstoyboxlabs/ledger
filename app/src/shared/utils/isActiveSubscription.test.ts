import { applyData } from '@/shared/utils/applyData'
import { isActiveSubscription } from './isActiveSubscription'
import type { Subscription } from '@/shared/types/Subscription'

const sub = (over: Partial<Subscription> = {}): Subscription => ({ name: 'X', cadence: 'monthly', amount: 10, account: 'chk', lastSeen: '2026-10-05', ...over })

describe('isActiveSubscription', () => {
  beforeEach(() =>
    applyData({ periods: { a: { account: 'chk', start: '2026-10-01', end: '2026-10-31' } } }),
  )
  afterEach(() => applyData({}))

  it('is active when it charged recently', () => {
    expect(isActiveSubscription(sub())).toBe(true)
  })
  it('ages out when last seen long before coverage end', () => {
    expect(isActiveSubscription(sub({ lastSeen: '2026-08-01' }))).toBe(false)
  })
  it('uses a 35 day window from coverage end', () => {
    expect(isActiveSubscription(sub({ lastSeen: '2026-09-26' }))).toBe(true)
    expect(isActiveSubscription(sub({ lastSeen: '2026-09-25' }))).toBe(false)
  })
  it('cancelled always loses, even annual or recent', () => {
    expect(isActiveSubscription(sub({ cancelled: true }))).toBe(false)
    expect(isActiveSubscription(sub({ cancelled: true, cadence: 'annual' }))).toBe(false)
  })
  it('annual plans are always active', () => {
    expect(isActiveSubscription(sub({ cadence: 'annual', lastSeen: '2020-01-01' }))).toBe(true)
  })
  it('is active when its account has no statements', () => {
    expect(isActiveSubscription(sub({ account: 'other', lastSeen: '2020-01-01' }))).toBe(true)
  })
})
