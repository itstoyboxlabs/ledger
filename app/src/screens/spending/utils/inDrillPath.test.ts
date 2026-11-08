import { inDrillPath } from '@/screens/spending/utils/inDrillPath'

describe('inDrillPath', () => {
  it('matches everything at the top level', () => {
    expect(inDrillPath({ cat: 'Housing', sub: 'Rent' }, [])).toBe(true)
    expect(inDrillPath({}, [])).toBe(true)
  })
  it('matches by category then subcategory', () => {
    expect(inDrillPath({ cat: 'Housing', sub: 'Rent' }, ['Housing'])).toBe(true)
    expect(inDrillPath({ cat: 'Housing', sub: 'Rent' }, ['Housing', 'Rent'])).toBe(true)
    expect(inDrillPath({ cat: 'Housing', sub: 'Rent' }, ['Housing', 'Storage'])).toBe(false)
    expect(inDrillPath({ cat: 'Food', sub: 'Rent' }, ['Housing'])).toBe(false)
  })
  it('drills into an uncategorized group', () => {
    expect(inDrillPath({}, [''])).toBe(true)
    expect(inDrillPath({ cat: 'Other' }, ['Other', ''])).toBe(true)
    expect(inDrillPath({}, ['', ''])).toBe(true)
    expect(inDrillPath({ cat: 'Other', sub: 'Misc' }, [''])).toBe(false)
  })
})
