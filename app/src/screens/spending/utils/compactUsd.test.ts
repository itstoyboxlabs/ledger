import { compactUsd } from '@/screens/spending/utils/compactUsd'

describe('compactUsd', () => {
  it('leaves values under 1000 as whole dollars', () => {
    expect(compactUsd(0)).toBe('$0')
    expect(compactUsd(999)).toBe('$999')
  })
  it('drops the decimal on exact thousands', () => {
    expect(compactUsd(1000)).toBe('$1k')
    expect(compactUsd(12000)).toBe('$12k')
  })
  it('keeps one decimal otherwise, rounded', () => {
    expect(compactUsd(1500)).toBe('$1.5k')
    expect(compactUsd(2349)).toBe('$2.3k')
  })
  it('handles negatives by magnitude', () => {
    expect(compactUsd(-2500)).toBe('$-2.5k')
    expect(compactUsd(-500)).toBe('$-500')
  })
})
