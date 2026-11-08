import { isIsoDate } from './isIsoDate'

describe('isIsoDate', () => {
  it('accepts real dates as YYYY-MM-DD', () => {
    expect(isIsoDate('1990-04-15')).toBe(true)
    expect(isIsoDate('2024-02-29')).toBe(true)
  })
  it('rejects other shapes and dates that do not exist', () => {
    for (const v of [null, 19900415, '', '04-15-1990', '1990-4-15', '2026-02-29', '2026-13-01', '2026-04-31', ' 1990-04-15']) {
      expect(isIsoDate(v)).toBe(false)
    }
  })
})
