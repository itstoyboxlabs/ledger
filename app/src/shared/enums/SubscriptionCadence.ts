const SubscriptionCadence = {
  monthly: 'monthly',
  weekly: 'weekly',
  annual: 'annual',
} as const

type SubscriptionCadence = (typeof SubscriptionCadence)[keyof typeof SubscriptionCadence]

export { SubscriptionCadence }
