import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import type { DismissedSubs } from '@/shared/types/DismissedSubs'

// removed on the Budget page and not charged again since (see `dismissedSubs`)
export const isDismissedSub = (dismissed: DismissedSubs | undefined, name: string): boolean => {
  const at = dismissed?.[name]
  if (at == null) return false
  const sub = getSubscriptions().find((x) => x.name === name)
  return !sub || sub.lastSeen <= at
}
