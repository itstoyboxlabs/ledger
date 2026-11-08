import { normalizeDebts } from './normalizeDebts'

describe('normalizeDebts', () => {
  it('cleans a debt list', () => {
    expect(normalizeDebts([{ id: 'a', name: 5, balance: 100, apr: '4.5', payment: 'x', budgetRow: '', linkName: 'L' }])).toEqual([
      { id: 'a', name: '', balance: 100, apr: 4.5, payment: 0, budgetRow: null, linkName: 'L' },
    ])
  })
  it('keeps a valid budgetRow and omits linkName when absent', () => {
    const [d] = normalizeDebts([{ id: 'a', name: 'Car', balance: 1, budgetRow: 'r1' }])
    expect(d.budgetRow).toBe('r1')
    expect('linkName' in d).toBe(false)
  })
  it('upgrades the legacy three-field shape in order', () => {
    const out = normalizeDebts({ loans: 100, card: 50, taxes: 0 })
    expect(out.map((d) => [d.id, d.name, d.balance])).toEqual([
      ['loans', 'Student loans', 100],
      ['card', 'Credit card debt', 50],
      ['taxes', 'Taxes owed', 0],
    ])
    expect(out[1].linkName).toBe('Credit card minimum payment')
  })
  it('returns [] for anything else', () => {
    expect(normalizeDebts(null)).toEqual([])
    expect(normalizeDebts([{ id: 'a' }])).toEqual([])
    expect(normalizeDebts({ loans: 1 })).toEqual([])
  })
})
