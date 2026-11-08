import { migrateEmployerMatch } from './migrateEmployerMatch'

const th = (ds: unknown[]) => ({ salary: 100000, deductions: ds })
const read = () => JSON.parse(localStorage.getItem('ledger:takeHome') ?? 'null')

describe('migrateEmployerMatch', () => {
  beforeEach(() => localStorage.clear())

  it('copies the old retirement match onto 401k deductions', () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ match401k: 50 }))
    localStorage.setItem('ledger:takeHome', JSON.stringify(th([{ id: 'a', kind: '401k', unit: 'pct', amount: 5 }, { id: 'b', kind: 'hsa', unit: 'mo', amount: 10 }])))
    migrateEmployerMatch()
    const out = read()
    expect(out.salary).toBe(100000)
    expect(out.deductions[0].match).toBe(50)
    expect('match' in out.deductions[1]).toBe(false)
  })
  it('does nothing when a deduction already has a match', () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ match401k: 50 }))
    const saved = JSON.stringify(th([{ id: 'a', kind: '401k', match: 0 }]))
    localStorage.setItem('ledger:takeHome', saved)
    migrateEmployerMatch()
    expect(localStorage.getItem('ledger:takeHome')).toBe(saved)
  })
  it('does nothing when the old match is 0 or nothing was saved', () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ match401k: 0 }))
    localStorage.setItem('ledger:takeHome', JSON.stringify(th([{ id: 'a', kind: '401k' }])))
    migrateEmployerMatch()
    expect('match' in read().deductions[0]).toBe(false)
    localStorage.clear()
    expect(() => migrateEmployerMatch()).not.toThrow()
    expect(localStorage.getItem('ledger:takeHome')).toBe(null)
  })
  it('does nothing without a 401k deduction', () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({}))
    const saved = JSON.stringify(th([{ id: 'b', kind: 'hsa' }]))
    localStorage.setItem('ledger:takeHome', saved)
    migrateEmployerMatch()
    expect(localStorage.getItem('ledger:takeHome')).toBe(saved)
  })
  it('swallows corrupt JSON', () => {
    localStorage.setItem('ledger:retireCalc', '{bad')
    expect(() => migrateEmployerMatch()).not.toThrow()
  })
})
