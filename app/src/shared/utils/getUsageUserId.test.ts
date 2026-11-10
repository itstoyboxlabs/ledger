import { getUsageUserId } from '@/shared/utils/getUsageUserId'

describe('getUsageUserId', () => {
  beforeEach(() => localStorage.clear())
  it('makes one random id and keeps it', () => {
    const a = getUsageUserId()
    expect(a).toMatch(/^[0-9a-f-]{36}$/)
    expect(getUsageUserId()).toBe(a)
  })
  it('replaces a saved value that is not an id', () => {
    localStorage.setItem('ledger-usage-id', 'hello')
    expect(getUsageUserId()).toMatch(/^[0-9a-f-]{36}$/)
  })
  it('stays out of the "ledger:" keys that exports read', () => {
    getUsageUserId()
    expect(Object.keys(localStorage).some((k) => k.startsWith('ledger:'))).toBe(false)
  })
})
