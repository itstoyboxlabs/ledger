import { pathForView } from '@/shared/utils/pathForView'

describe('pathForView', () => {
  it('gives each screen its own address', () => {
    expect(pathForView('actuals')).toBe('/app/spending')
    expect(pathForView('retirement')).toBe('/app/retirement')
  })
  it('falls back to /app for an unknown screen', () => {
    expect(pathForView('nope')).toBe('/app')
  })
})
