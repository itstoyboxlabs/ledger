import { getUsageSessionId } from '@/shared/utils/getUsageSessionId'
import { getUsageUserId } from '@/shared/utils/getUsageUserId'
import { scrubError } from '@/shared/utils/scrubError'
import { usageEnabled } from '@/shared/utils/usageEnabled'
import type { UsageEvent } from '@/shared/types/UsageEvent'

// The one way the app reports usage. track('budget_changed') says only that it happened, on which route. Nothing
// else is attached: never a value, name, amount, note or date. A crash adds a scrubbed message. The same event on
// the same route sends at most once every 30 seconds, and events go out together in one request (see api/usage.js).
const THROTTLE_MS = 30_000
const FLUSH_MS = 3_000
const MAX_BATCH = 20

type Queued = { event: UsageEvent; route: string; error?: string }

let queue: Queued[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let hooked = false
const lastSent = new Map<string, number>()

function flush() {
  if (timer) clearTimeout(timer)
  timer = null
  if (!queue.length) return
  const events = queue
  queue = []
  try {
    const body = JSON.stringify({ user: getUsageUserId(), session: getUsageSessionId(), events })
    // text/plain keeps it a simple request, and sendBeacon survives the page closing
    if (navigator.sendBeacon?.('/api/usage', new Blob([body], { type: 'text/plain' }))) return
    void fetch('/api/usage', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(() => {})
  } catch {
    // tracking is best effort
  }
}

export function track(event: UsageEvent, error?: string): void {
  try {
    if (!usageEnabled()) return
    const route = window.location.pathname.replace(/\/+$/, '') || '/'
    const message = event === 'crash' ? scrubError(error ?? '') : undefined
    const id = `${event}|${message ?? route}`
    const now = Date.now()
    if (now - (lastSent.get(id) ?? -Infinity) < THROTTLE_MS) return
    lastSent.set(id, now)
    queue.push(message === undefined ? { event, route } : { event, route, error: message })
    if (!hooked) {
      hooked = true
      window.addEventListener('pagehide', flush)
      document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush())
    }
    if (queue.length >= MAX_BATCH) flush()
    else if (!timer) timer = setTimeout(flush, FLUSH_MS)
  } catch {
    // tracking is best effort
  }
}
