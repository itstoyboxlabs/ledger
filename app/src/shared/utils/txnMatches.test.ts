import { txnMatches } from './txnMatches'

const t = { merchant: 'Trader Joe\'s', cat: 'Food & Dining', sub: 'Groceries' }

describe('txnMatches', () => {
  it('never matches a null match', () => expect(txnMatches(t, null)).toBe(false))
  it('matches by merchant or merchants', () => {
    expect(txnMatches(t, { merchant: "Trader Joe's" })).toBe(true)
    expect(txnMatches(t, { merchant: 'Other' })).toBe(false)
    expect(txnMatches(t, { merchants: ['A', "Trader Joe's"] })).toBe(true)
  })
  it('matches by category with optional sub', () => {
    expect(txnMatches(t, { cat: 'Food & Dining' })).toBe(true)
    expect(txnMatches(t, { cat: 'Food & Dining', sub: 'Groceries' })).toBe(true)
    expect(txnMatches(t, { cat: 'Food & Dining', sub: 'Restaurants' })).toBe(false)
  })
  it('matches any of cats', () => {
    expect(txnMatches(t, { cats: [{ cat: 'Housing' }, { cat: 'Food & Dining', sub: 'Groceries' }] })).toBe(true)
    expect(txnMatches(t, { cats: [{ cat: 'Housing' }] })).toBe(false)
    expect(txnMatches(t, {})).toBe(false)
  })
})
