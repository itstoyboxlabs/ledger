import { withPresetIds } from './withPresetIds'
import { presetIdFor } from './presetIdFor'

describe('withPresetIds', () => {
  it('gives old presets an id from their name and keeps names and data', () => {
    expect(withPresetIds([{ name: 'Lean', data: 1 }])).toEqual([{ id: presetIdFor('Lean'), name: 'Lean', data: 1 }])
  })
  it('keeps existing ids and returns the same list when none are missing', () => {
    const list = [{ id: 'x', name: 'A', data: 1 }]
    expect(withPresetIds(list)).toBe(list)
  })
  it('keeps ids unique for a repeated name', () => {
    const out = withPresetIds([{ name: 'A', data: 1 }, { name: 'A', data: 2 }])
    expect(out[0].id).not.toBe(out[1].id)
  })
})
