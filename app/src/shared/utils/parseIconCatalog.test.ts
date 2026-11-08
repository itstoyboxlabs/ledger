import { parseIconCatalog } from './parseIconCatalog'

describe('parseIconCatalog', () => {
  it('accepts a well formed index', () => {
    const raw = { domains: ['uber.com'], names: { uber: 'uber.com' } }
    expect(parseIconCatalog(raw)).toEqual(raw)
  })
  it('drops names that do not point at a string', () => {
    expect(parseIconCatalog({ domains: [], names: { a: 'a.com', b: 3 } })).toEqual({ domains: [], names: { a: 'a.com' } })
  })
  it('rejects anything else', () => {
    expect(parseIconCatalog(null)).toBeNull()
    expect(parseIconCatalog('x')).toBeNull()
    expect(parseIconCatalog(['uber.com'])).toBeNull()
    expect(parseIconCatalog({ domains: [1], names: {} })).toBeNull()
    expect(parseIconCatalog({ domains: [], names: [] })).toBeNull()
    expect(parseIconCatalog({ domains: [] })).toBeNull()
  })
})
