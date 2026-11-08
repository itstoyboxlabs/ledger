import type { SubscriptionCadence } from '@/shared/enums/SubscriptionCadence'

export interface Subscription {
  name: string
  what?: string
  account: string
  cadence: SubscriptionCadence
  amount: number
  lastSeen: string // YYYY-MM-DD
  billing?: string
  cancelled?: boolean
}
