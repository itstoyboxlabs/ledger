// A value saved under a "ledger:<key>" localStorage key, with the JSON string last seen there.
export interface PersistedEntry<T = unknown> {
  value: T
  raw: string | null
}
