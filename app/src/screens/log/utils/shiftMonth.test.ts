import { shiftMonth } from './shiftMonth'

describe('shiftMonth', () => {
  it('moves forward and back', () => {
    expect(shiftMonth('2026-05', 1)).toBe('2026-06')
    expect(shiftMonth('2026-05', -1)).toBe('2026-04')
  })
  it('rolls over year boundaries', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })
  it('zero is a no-op and large deltas work', () => {
    expect(shiftMonth('2026-07', 0)).toBe('2026-07')
    expect(shiftMonth('2026-07', 18)).toBe('2028-01')
    expect(shiftMonth('2026-07', -12)).toBe('2025-07')
  })
})
