import { parseSumExpr } from './parseSumExpr'

describe('parseSumExpr', () => {
  it('returns nothing for empty input', () => {
    expect(parseSumExpr('')).toEqual({ terms: [], total: 0 })
    expect(parseSumExpr('   ')).toEqual({ terms: [], total: 0 })
    expect(parseSumExpr(undefined)).toEqual({ terms: [], total: 0 })
  })
  it('parses terms with labels and signs', () => {
    const r = parseSumExpr('3200 checking + 4315 paycheck - 50 fee')
    expect(r.terms).toEqual([
      { value: 3200, label: 'checking' },
      { value: 4315, label: 'paycheck' },
      { value: -50, label: 'fee' },
    ])
    expect(r.total).toBe(7465)
  })
  it('handles commas, dollar signs and decimals', () => {
    const r = parseSumExpr('$1,250.50 rent + .5 tip')
    expect(r.terms.map((t) => t.value)).toEqual([1250.5, 0.5])
    expect(r.total).toBe(1251)
  })
  it('handles a leading minus and skips chunks without numbers', () => {
    const r = parseSumExpr('-20 refund + oops + 5')
    expect(r.terms.map((t) => t.value)).toEqual([-20, 5])
    expect(r.total).toBe(-15)
  })
})
