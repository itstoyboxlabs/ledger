import { presetDebts } from './presetDebts'

const debt = { id: 'd1', name: 'Card', balance: 1200, apr: 20, payment: 100, budgetRow: null }

describe('presetDebts', () => {
  it('returns the debts of a current preset', () => {
    expect(presetDebts({ debts: [debt] })).toEqual([debt])
  })

  it('still loads an old preset that carries a tax state, and ignores it', () => {
    const out = presetDebts({ taxState: 'ca', debts: [debt] })
    expect(out).toEqual([debt])
    expect(out).not.toHaveProperty('taxState')
  })

  it('returns null when there are no debts', () => {
    expect(presetDebts({ taxState: 'ca' })).toBeNull()
    expect(presetDebts(null)).toBeNull()
  })
})
