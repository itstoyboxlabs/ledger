import { DEDUCTION_KINDS } from '@/shared/constants/DEDUCTION_KINDS'
import { deductionKind } from './deductionKind'

describe('deductionKind', () => {
  it('finds a kind entry', () => expect(deductionKind('hsa')).toEqual(['hsa', 'HSA', 'all']))
  it('falls back to the first kind when unknown', () => {
    expect(deductionKind('nope')).toBe(DEDUCTION_KINDS[0])
    expect(deductionKind(undefined as unknown as string)).toBe(DEDUCTION_KINDS[0])
  })
})
