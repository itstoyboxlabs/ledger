// One piece of guide text: plain words, a label exactly as it reads in the app, a link that
// switches to another tab, a link to a heading on this page, an outside link or a bit of code.
export type GuideInline =
  | string
  | { label: string }
  | { tab: string; text: string }
  | { anchor: string; text: string }
  | { href: string; text: string }
  | { code: string }
