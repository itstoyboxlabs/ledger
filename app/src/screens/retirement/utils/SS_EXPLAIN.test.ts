import { SS_EXPLAIN } from './SS_EXPLAIN'

describe('SS_EXPLAIN', () => {
  it('mentions the salary, claim age and monthly figure', () => {
    const t = SS_EXPLAIN(80000, 67, 2500)
    expect(t).toContain('$80,000')
    expect(t).toContain('claiming at 67')
    expect(t).toContain('$2,500 a month')
  })
  it('states the bend points and wage base', () => {
    const t = SS_EXPLAIN(80000, 67, 2500)
    expect(t).toContain('$1,286')
    expect(t).toContain('$6,463')
    expect(t).toContain('$184,500')
  })
  it('clamps the claim age to 62-70 and falls back to 67', () => {
    expect(SS_EXPLAIN(1, 50, 1)).toContain('claiming at 62')
    expect(SS_EXPLAIN(1, 99, 1)).toContain('claiming at 70')
    expect(SS_EXPLAIN(1, 'x', 1)).toContain('claiming at 67')
  })
})
