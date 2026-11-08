import { scopeLabel } from '@/screens/spending/utils/scopeLabel'

describe('scopeLabel', () => {
  it('labels all months', () => {
    expect(scopeLabel('all')).toBe('All months')
  })
  it('labels each range option', () => {
    expect(scopeLabel('lastMonth')).toBe('Last month')
    expect(scopeLabel('last3')).toBe('Last 3 months')
    expect(scopeLabel('last6')).toBe('Last 6 months')
    expect(scopeLabel('ytd')).toBe('Year to date')
  })
  it('labels a single month by name and year', () => {
    expect(scopeLabel('2026-07')).toBe('Jul 2026')
  })
})
