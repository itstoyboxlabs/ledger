import { budgetDiff } from './budgetDiff'

describe('budgetDiff', () => {
  it('rounds both sides before subtracting', () => {
    expect(budgetDiff(74.6, 74.4)).toBe(1)
    expect(budgetDiff(100.4, 100.6)).toBe(-1)
    expect(Object.is(budgetDiff(50.2, 50.4), 0)).toBe(true)
  })
  it('is positive under budget and negative over', () => {
    expect(budgetDiff(300, 250)).toBe(50)
    expect(budgetDiff(300, 350)).toBe(-50)
  })
  it('reads a net refund against no budget as under budget', () => {
    expect(budgetDiff(0, -50)).toBe(50)
    expect(budgetDiff(0, 80)).toBe(-80)
  })
})
