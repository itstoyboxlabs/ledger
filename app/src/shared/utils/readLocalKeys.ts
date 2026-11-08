import { LS_PREFIX } from '@/shared/constants/LS_PREFIX'

export function readLocalKeys(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(LS_PREFIX)) continue
      const raw = localStorage.getItem(k)
      try {
        out[k] = JSON.parse(raw as string)
      } catch {
        out[k] = raw
      }
    }
  } catch { /* storage unavailable */ }
  return out
}
