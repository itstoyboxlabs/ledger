// Usage events are sent only from a real deployment: never from the dev server or a localhost address, so running
// Ledger on your own computer sends nothing.
export function usageEnabled(hostname: string = window.location.hostname): boolean {
  if (import.meta.env.DEV) return false
  return !/^(localhost|127\.0\.0\.1|\[::1\]|::1|.*\.localhost)$/i.test(hostname)
}
