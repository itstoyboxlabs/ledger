import { ssClaimFactor } from './ssClaimFactor'

describe('ssClaimFactor', () => {
  it('pays 70% at 62, 100% at 67 and 124% at 70', () => {
    expect(ssClaimFactor(62)).toBeCloseTo(0.7, 10)
    expect(ssClaimFactor(67)).toBeCloseTo(1, 10)
    expect(ssClaimFactor(70)).toBeCloseTo(1.24, 10)
  })
  it('cuts 5/9 of 1% a month for the first 36 months early, 5/12 of 1% beyond', () => {
    expect(ssClaimFactor(64)).toBeCloseTo(0.8, 10)
    expect(ssClaimFactor(65)).toBeCloseTo(0.8667, 4)
    expect(ssClaimFactor(66)).toBeCloseTo(0.9333, 4)
    expect(ssClaimFactor(63)).toBeCloseTo(0.75, 10)
  })
  it('adds 8% a year after 67', () => {
    expect(ssClaimFactor(68.5)).toBeCloseTo(1.12, 10)
  })
  it('clamps outside 62 to 70', () => {
    expect(ssClaimFactor(50)).toBeCloseTo(0.7, 10)
    expect(ssClaimFactor(80)).toBeCloseTo(1.24, 10)
  })
  it('defaults to 67 for missing or junk input', () => {
    expect(ssClaimFactor(undefined)).toBe(1)
    expect(ssClaimFactor('abc')).toBe(1)
    expect(ssClaimFactor(0)).toBe(1)
  })
  it('accepts numeric strings', () => {
    expect(ssClaimFactor('65')).toBeCloseTo(0.8667, 4)
  })
})
