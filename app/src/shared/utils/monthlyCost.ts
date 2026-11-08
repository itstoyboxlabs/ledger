import type { Subscription } from '@/shared/types/Subscription'
export function monthlyCost(s: Pick<Subscription, 'cadence' | 'amount'>): number {
  return s.cadence === 'annual' ? s.amount / 12 : s.amount
}
