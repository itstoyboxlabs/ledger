// One link in the "On this page" table of contents, with the links nested under it.
export type TocEntry = { id: string; title: string; children: TocEntry[] }
