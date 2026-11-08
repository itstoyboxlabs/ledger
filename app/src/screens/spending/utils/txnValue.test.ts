import { txnValue } from '@/screens/spending/utils/txnValue'

describe('txnValue', () => {
  it('shows expenses as positive', () => {
    expect(txnValue({ kind: 'expense', amount: 12.5 })).toBe(12.5)
  })
  it('shows refunds as negative', () => {
    expect(txnValue({ kind: 'refund', amount: 8 })).toBe(-8)
  })
  it('shows income as positive', () => {
    expect(txnValue({ kind: 'income', amount: 2000 })).toBe(2000)
  })
  it('is zero for other kinds and zero amounts', () => {
    expect(txnValue({ kind: 'transfer', amount: 50 })).toBe(0)
    expect(txnValue({ kind: 'expense', amount: 0 })).toBe(0)
  })
})
