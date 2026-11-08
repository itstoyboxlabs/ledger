import type { Subscription } from '@/shared/types/Subscription'
export function monthlyCost(s: Pick<Subscription, 'cadence' | 'amount'>): number {
  if (s.cadence === 'annual') return s.amount / 12
  if (s.cadence === 'weekly') return (s.amount * 52) / 12
  return s.amount
}
