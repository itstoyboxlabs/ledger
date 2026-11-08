import { applyData } from '@/shared/utils/applyData'
import { isBudgetRowHidden } from './isBudgetRowHidden'

describe('isBudgetRowHidden', () => {
  beforeEach(() =>
    applyData({
      periods: { a: { account: 'chk', start: '2026-10-01', end: '2026-10-31' } },
      subscriptions: [
        { name: 'Netflix', cadence: 'monthly', amount: 15, account: 'chk', lastSeen: '2026-10-12' },
        { name: 'OldGym', cadence: 'monthly', amount: 30, account: 'chk', lastSeen: '2026-06-01' },
      ],
    }),
  )
  afterEach(() => applyData({}))

  it('never hides rows that are not from subscriptions', () => {
    expect(isBudgetRowHidden({ source: 'manual', name: 'OldGym' })).toBe(false)
    expect(isBudgetRowHidden({ name: 'OldGym' })).toBe(false)
  })
  it('shows a subscription row whose sub is active', () => {
    expect(isBudgetRowHidden({ source: 'subscription', name: 'Netflix' })).toBe(false)
  })
  it('hides a subscription row whose sub stopped charging', () => {
    expect(isBudgetRowHidden({ source: 'subscription', name: 'OldGym' })).toBe(true)
  })
  it('shows a row with no matching statement subscription', () => {
    expect(isBudgetRowHidden({ source: 'subscription', name: 'Unknown' })).toBe(false)
  })
})
