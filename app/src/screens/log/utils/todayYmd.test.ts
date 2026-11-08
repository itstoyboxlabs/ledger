import { todayYmd } from './todayYmd'

describe('todayYmd', () => {
  afterEach(() => vi.useRealTimers())
  it('formats the current local date', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-08T12:00:00'))
    expect(todayYmd()).toBe('2026-11-08')
  })
  it('pads single digit months and days', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-01-03T09:00:00'))
    expect(todayYmd()).toBe('2026-01-03')
  })
  it('uses local time at the end of the day', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-12-31T23:59:00'))
    expect(todayYmd()).toBe('2026-12-31')
  })
})
