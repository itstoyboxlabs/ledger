// A random id for this browser, kept in localStorage so one person counts once across visits. It is not under the
// "ledger:" prefix, so it never goes into an export and a data reset does not touch it. Falls back to a fresh id
// when storage is unavailable.
const KEY = 'ledger-usage-id'

export function getUsageUserId(): string {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && /^[0-9a-f-]{36}$/i.test(saved)) return saved
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}
