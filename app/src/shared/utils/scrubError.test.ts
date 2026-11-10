import { scrubError } from '@/shared/utils/scrubError'

describe('scrubError', () => {
  it('removes numbers longer than 4 digits, with or without separators', () => {
    expect(scrubError('bad value 123456 and 1,234,567.89 and 2026')).toBe('bad value # and # and 2026')
  })
  it('removes email addresses', () => {
    expect(scrubError('failed for a@b.com now')).toBe('failed for [email] now')
  })
  it('cuts to 300 characters', () => {
    expect(scrubError('x'.repeat(500))).toHaveLength(300)
  })
})
