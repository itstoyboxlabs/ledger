import { percentOf } from '@/screens/marketing/utils/percentOf'

describe('percentOf', () => {
  it('gives one decimal and a percent sign', () => {
    expect(percentOf(50, 200)).toBe('25.0%')
    expect(percentOf(3300, 6405.05)).toBe('51.5%')
  })
})
