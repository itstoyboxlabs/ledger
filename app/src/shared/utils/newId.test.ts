import { newId } from './newId'

describe('newId', () => {
  it('starts with the prefix', () => expect(newId('row-').startsWith('row-')).toBe(true))
  it('is unique across many calls', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId('x')))
    expect(ids.size).toBeGreaterThan(190)
  })
  it('embeds the time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-08T12:00:00'))
    expect(newId('a')).toContain(Date.now().toString(36))
    vi.useRealTimers()
  })
})
