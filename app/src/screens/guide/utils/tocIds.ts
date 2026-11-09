import type { TocEntry } from '@/screens/guide/types/TocEntry'

// Every heading id in the table of contents, in page order (a section, then its subsections).
export function tocIds(toc: readonly TocEntry[]): string[] {
  return toc.flatMap((t) => [t.id, ...tocIds(t.children)])
}
