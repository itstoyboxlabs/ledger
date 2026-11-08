import { deductionTax } from './deductionTax'

describe('deductionTax', () => {
  it('returns which taxes the deduction skips', () => {
    expect(deductionTax('401k')).toBe('income')
    expect(deductionTax('insurance')).toBe('all')
    expect(deductionTax('dues')).toBe('none')
  })
  it('treats unknown kinds like the first kind', () => expect(deductionTax('nope')).toBe('income'))
})
