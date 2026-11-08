import { formatMoney } from '@/screens/marketing/utils/formatMoney'

describe('formatMoney', () => {
  it('adds the dollar sign, commas and two decimals', () => {
    expect(formatMoney(6405.05)).toBe('$6,405.05')
    expect(formatMoney(300)).toBe('$300.00')
  })
})
