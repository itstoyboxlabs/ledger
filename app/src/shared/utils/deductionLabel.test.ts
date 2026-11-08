import { deductionLabel } from './deductionLabel'

describe('deductionLabel', () => {
  it('returns the display label', () => expect(deductionLabel('roth401k')).toBe('Roth 401k'))
  it('uses the first kind label for unknown kinds', () => expect(deductionLabel('nope')).toBe('401k'))
})
