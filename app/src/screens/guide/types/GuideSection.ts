import type { GuideBlock } from '@/screens/guide/types/GuideBlock'
import type { GuideSubsection } from '@/screens/guide/types/GuideSubsection'

// A section of the guide: an h2, the text under it and its subsections.
export type GuideSection = { id: string; title: string; blocks: GuideBlock[]; subsections: GuideSubsection[] }
