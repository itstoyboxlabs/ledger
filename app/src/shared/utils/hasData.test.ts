import { applyData } from '@/shared/utils/applyData'
import { hasData } from './hasData'

describe('hasData', () => {
  afterEach(() => applyData({}))

  it('is false when nothing is loaded', () => {
    applyData({})
    expect(hasData()).toBe(false)
  })
  it('is false with accounts but no transactions', () => {
    applyData({ accounts: { chk: { name: 'Checking' } } })
    expect(hasData()).toBe(false)
  })
  it('is true once there is a transaction', () => {
    applyData({ transactions: [{ id: '1', date: '2026-10-03', account: 'chk', kind: 'expense', amount: 5 }] })
    expect(hasData()).toBe(true)
  })
})
