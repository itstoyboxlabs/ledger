import { progressive } from './progressive'
import type { TaxBracket } from '@/shared/types/TaxBracket'

const B: TaxBracket[] = [[10, 0.1], [20, 0.2], [Infinity, 0.3]]

describe('progressive', () => {
  it('is zero for zero or negative income', () => {
    expect(progressive(0, B)).toBe(0)
    expect(progressive(-50, B)).toBe(0)
  })
  it('taxes within the first bracket', () => {
    expect(progressive(5, B)).toBeCloseTo(0.5, 10)
  })
  it('taxes only the slice in each bracket', () => {
    expect(progressive(15, B)).toBeCloseTo(1 + 1, 10)
    expect(progressive(25, B)).toBeCloseTo(1 + 2 + 1.5, 10)
  })
  it('is exact at a bracket edge', () => {
    expect(progressive(10, B)).toBeCloseTo(1, 10)
    expect(progressive(20, B)).toBeCloseTo(3, 10)
  })
  it('handles a single flat bracket and an empty list', () => {
    expect(progressive(1000, [[Infinity, 0.05]])).toBeCloseTo(50, 10)
    expect(progressive(1000, [])).toBe(0)
  })
})
