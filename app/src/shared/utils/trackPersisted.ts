import { PERSISTED_USAGE_EVENTS } from '@/shared/constants/PERSISTED_USAGE_EVENTS'
import { track } from '@/shared/utils/track'

// Called when a person changes a saved value. Reports the matching usage event, or nothing for keys that are only
// filters or sort orders. The value itself is never looked at.
export function trackPersisted(key: string): void {
  const event = PERSISTED_USAGE_EVENTS[key]
  if (event) track(event)
}
