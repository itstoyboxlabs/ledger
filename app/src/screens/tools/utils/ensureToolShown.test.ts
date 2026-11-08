import { ensureToolShown } from './ensureToolShown'

const saved = () => JSON.parse(localStorage.getItem('ledger:toolsShown') ?? 'null')

beforeEach(() => localStorage.clear())

describe('ensureToolShown', () => {
  it('adds the tool to a saved list', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['hourly']))
    ensureToolShown('takehome')
    expect(saved()).toEqual(['hourly', 'takehome'])
  })
  it('leaves a list that already has it alone', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['takehome', 'hourly']))
    ensureToolShown('takehome')
    expect(saved()).toEqual(['takehome', 'hourly'])
  })
  it('writes nothing when no list is saved (every tool is shown)', () => {
    ensureToolShown('takehome')
    expect(saved()).toBeNull()
  })
  it('ignores a saved value it cannot read', () => {
    localStorage.setItem('ledger:toolsShown', '{bad')
    expect(() => ensureToolShown('takehome')).not.toThrow()
    expect(localStorage.getItem('ledger:toolsShown')).toBe('{bad')
  })
})
