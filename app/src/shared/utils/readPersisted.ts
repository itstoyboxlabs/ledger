// Reads "ledger:<key>" from localStorage. Returns { raw, value }: raw is the stored string (or null), value is the
// parsed value, or the fallback when nothing is stored, the JSON is corrupted or validate() rejects it.
export function readPersisted<T>(key: string, fallback: T, validate?: (v: unknown) => boolean): { raw: string | null; value: T } {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(`ledger:${key}`)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (!validate || validate(parsed)) return { raw, value: parsed as T }
    }
  } catch { /* corrupted or unavailable: use the fallback */ }
  return { raw, value: fallback }
}
