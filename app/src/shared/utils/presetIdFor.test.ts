import { presetIdFor } from './presetIdFor'

describe('presetIdFor', () => {
  it('is the same for the same name and differs for another', () => {
    expect(presetIdFor('Lean')).toBe(presetIdFor('Lean'))
    expect(presetIdFor('Lean')).not.toBe(presetIdFor('Loose'))
    expect(presetIdFor('Lean')).toMatch(/^pn[0-9a-z]+$/)
  })
})
