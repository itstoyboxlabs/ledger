import { retireNeed } from './retireNeed'

const OPTS = [{ id: 'pr1', name: 'Retirement', monthly: 3200 }, { id: 'pr2', name: 'Lean', monthly: 2100 }]

describe('retireNeed', () => {
  it('uses the typed number when no preset is picked', () => {
    expect(retireNeed(null, OPTS, 5000)).toEqual({ monthly: 5000, status: 'typed', preset: null, id: null })
    expect(retireNeed('', OPTS, 5000).status).toBe('typed')
  })
  it('uses the picked preset by id, whatever its name now', () => {
    expect(retireNeed('pr2', OPTS, 5000)).toEqual({ monthly: 2100, status: 'preset', preset: 'Lean', id: 'pr2' })
  })
  it('still finds a preset stored by name before ids, and gives its id', () => {
    expect(retireNeed('Lean', OPTS, 5000)).toEqual({ monthly: 2100, status: 'preset', preset: 'Lean', id: 'pr2' })
  })
  it('falls back to the typed number while presets load', () => {
    expect(retireNeed('pr2', null, 5000)).toEqual({ monthly: 5000, status: 'loading', preset: null, id: 'pr2' })
  })
  it('falls back to the typed number when the preset is gone', () => {
    expect(retireNeed('gone', OPTS, 4000)).toEqual({ monthly: 4000, status: 'missing', preset: null, id: 'gone' })
    expect(retireNeed('gone', [], 4000).status).toBe('missing')
  })
})
