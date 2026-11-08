import type { Subscription } from '@/shared/types/Subscription'

// Sort value for one subscriptions column.
export type SubsValue = (s: Subscription) => string | number
