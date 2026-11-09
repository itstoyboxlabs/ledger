import { buildToc } from './buildToc'
import { GUIDE_SECTIONS } from '@/screens/guide/constants/GUIDE_SECTIONS'
import type { GuideSection } from '@/screens/guide/types/GuideSection'

const sections: GuideSection[] = [
  { id: 'a', title: 'A', blocks: [], subsections: [{ id: 'a1', title: 'A one', blocks: [] }, { id: 'a2', title: 'A two', blocks: [] }] },
  { id: 'b', title: 'B', blocks: [], subsections: [] },
]

describe('buildToc', () => {
  it('nests each section\'s subsections under it, in order', () => {
    expect(buildToc(sections)).toEqual([
      { id: 'a', title: 'A', children: [{ id: 'a1', title: 'A one', children: [] }, { id: 'a2', title: 'A two', children: [] }] },
      { id: 'b', title: 'B', children: [] },
    ])
  })

  it('is empty for no sections', () => {
    expect(buildToc([])).toEqual([])
  })

  it('has an entry for every section and subsection of the guide', () => {
    const toc = buildToc(GUIDE_SECTIONS)
    expect(toc.map((t) => t.title)).toEqual(GUIDE_SECTIONS.map((s) => s.title))
    toc.forEach((t, i) => expect(t.children).toHaveLength(GUIDE_SECTIONS[i].subsections.length))
  })
})
