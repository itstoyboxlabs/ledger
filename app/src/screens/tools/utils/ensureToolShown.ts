import { LS_PREFIX } from '@/shared/constants/LS_PREFIX'

// Switches a tool on in the Tools picker before jumping to it. Only adds to a saved list: with
// nothing saved every tool is already shown.
export function ensureToolShown(id: string): void {
  const key = `${LS_PREFIX}toolsShown`
  try {
    const cur = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (Array.isArray(cur) && !cur.includes(id)) localStorage.setItem(key, JSON.stringify([...cur, id]))
  } catch { /* storage unavailable */ }
}
