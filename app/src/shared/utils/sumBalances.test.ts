import { sumBalances } from './sumBalances'

describe('sumBalances', () => {
  it('is 0 for no debts', () => expect(sumBalances([])).toBe(0))
  it('adds balances', () => expect(sumBalances([{ balance: 1000.5 }, { balance: 250 }, { balance: 0 }])).toBe(1250.5))
  it('handles negatives', () => expect(sumBalances([{ balance: 100 }, { balance: -40 }])).toBe(60))
})
