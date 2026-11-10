import { getUsageSessionId } from '@/shared/utils/getUsageSessionId'

describe('getUsageSessionId', () => {
  it('is a uuid that stays the same for the page load', () => {
    expect(getUsageSessionId()).toMatch(/^[0-9a-f-]{36}$/)
    expect(getUsageSessionId()).toBe(getUsageSessionId())
  })
})
