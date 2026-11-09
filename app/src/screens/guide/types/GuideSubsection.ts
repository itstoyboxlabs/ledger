import type { GuideBlock } from '@/screens/guide/types/GuideBlock'

// A subsection of the guide: an h3 with its own id, so the table of contents can link to it.
export type GuideSubsection = { id: string; title: string; blocks: GuideBlock[] }
