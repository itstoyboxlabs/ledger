import type { GuideInline } from '@/screens/guide/types/GuideInline'

// A block of guide text: a paragraph, a boxed note with a short title, a bulleted list or
// numbered steps. List items are runs of inline text. `importPrompt` places the copy, download
// and show buttons for the import prompt.
export type GuideBlock =
  | { kind: 'p'; text: GuideInline[] }
  | { kind: 'note'; title: string; text: GuideInline[] }
  | { kind: 'list'; items: GuideInline[][] }
  | { kind: 'steps'; items: GuideInline[][] }
  | { kind: 'importPrompt' }
