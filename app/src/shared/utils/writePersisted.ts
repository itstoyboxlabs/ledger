// Saves a value under "ledger:<key>" and returns the JSON string written (null when storage is unavailable).
export function writePersisted(key: string, value: unknown): string | null {
  try {
    const raw = JSON.stringify(value)
    localStorage.setItem(`ledger:${key}`, raw)
    return raw
  } catch {
    return null // storage unavailable: the value just will not persist
  }
}
