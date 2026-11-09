import type { GuideSection } from '@/screens/guide/types/GuideSection'
import type { TocEntry } from '@/screens/guide/types/TocEntry'

// The "On this page" tree: one entry per section with its subsections nested under it, in page order.
export function buildToc(sections: readonly GuideSection[]): TocEntry[] {
  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    children: s.subsections.map((sub) => ({ id: sub.id, title: sub.title, children: [] })),
  }))
}
