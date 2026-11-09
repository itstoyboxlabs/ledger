import { tocIds } from './tocIds'
import { buildToc } from './buildToc'
import { GUIDE_SECTIONS } from '@/screens/guide/constants/GUIDE_SECTIONS'

describe('tocIds', () => {
  it('lists ids in page order', () => {
    expect(tocIds([
      { id: 'a', title: 'A', children: [{ id: 'a1', title: '', children: [] }] },
      { id: 'b', title: 'B', children: [] },
    ])).toEqual(['a', 'a1', 'b'])
  })

  it('finds no duplicate ids in the guide', () => {
    const ids = tocIds(buildToc(GUIDE_SECTIONS))
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
  })
})
