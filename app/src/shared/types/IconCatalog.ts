// The logo catalog's index.json: every domain with a logo, and normalized merchant names pointing at one of them.
export interface IconCatalog {
  domains: string[]
  names: Record<string, string>
}
