import { fmt0 } from './fmt0'

describe('fmt0', () => {
  it('formats whole dollars', () => {
    expect(fmt0(1234)).toBe('$1,234')
    expect(fmt0(0)).toBe('$0')
  })
  it('rounds cents', () => {
    expect(fmt0(1234.6)).toBe('$1,235')
    expect(fmt0(1234.4)).toBe('$1,234')
  })
  it('uses a true minus sign for negatives', () => {
    expect(fmt0(-1500)).toBe('−$1,500')
  })
  it('handles large numbers', () => {
    expect(fmt0(12345678)).toBe('$12,345,678')
  })
})
