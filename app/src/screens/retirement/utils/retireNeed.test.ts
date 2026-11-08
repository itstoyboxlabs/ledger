import { retireNeed } from './retireNeed'

const OPTS = [{ name: 'Retirement', monthly: 3200 }, { name: 'Lean', monthly: 2100 }]

describe('retireNeed', () => {
  it('uses the typed number when no preset is picked', () => {
    expect(retireNeed(null, OPTS, 5000)).toEqual({ monthly: 5000, status: 'typed', preset: null })
    expect(retireNeed('', OPTS, 5000).status).toBe('typed')
  })
  it('uses the picked preset by name', () => {
    expect(retireNeed('Lean', OPTS, 5000)).toEqual({ monthly: 2100, status: 'preset', preset: 'Lean' })
  })
  it('falls back to the typed number while presets load', () => {
    expect(retireNeed('Lean', null, 5000)).toEqual({ monthly: 5000, status: 'loading', preset: 'Lean' })
  })
  it('falls back to the typed number when the preset is gone', () => {
    expect(retireNeed('Old', OPTS, 4000)).toEqual({ monthly: 4000, status: 'missing', preset: 'Old' })
    expect(retireNeed('Old', [], 4000).status).toBe('missing')
  })
})
