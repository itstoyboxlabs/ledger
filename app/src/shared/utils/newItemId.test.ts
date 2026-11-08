import { newItemId } from './newItemId'

describe('newItemId', () => {
  it('starts with i and is a plain lowercase token', () => expect(newItemId()).toMatch(/^i[a-z0-9]+$/))
  it('differs between calls', () => {
    const ids = new Set(Array.from({ length: 200 }, newItemId))
    expect(ids.size).toBeGreaterThan(190)
  })
})
