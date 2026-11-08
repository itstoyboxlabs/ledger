import { coverageEnd } from '@/shared/utils/coverageEnd'
import type { Subscription } from '@/shared/types/Subscription'

// a subscription is "active" if it charged within ~a month of the end of its own
// account's statement coverage. Cancelled subs age out automatically; a new charge
// on a future statement brings them back. Annual plans always count as active.
export function isActiveSubscription(s: Subscription): boolean {
  // explicitly cancelled by Josh — the statements can lag a real cancellation by a
  // billing cycle (or show a charge that gets refunded days later), so this flag
  // wins over the lastSeen window below
  if (s.cancelled) return false
  if (s.cadence === 'annual') return true
  const end = coverageEnd(s.account)
  if (!end) return true
  const windowStart = new Date(end + 'T12:00')
  windowStart.setDate(windowStart.getDate() - 35)
  return new Date(s.lastSeen + 'T12:00') >= windowStart
}
