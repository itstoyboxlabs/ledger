import type { RetirePhase } from '@/screens/retirement/types/RetirePhase'

// One year of the projection.
export interface RetireSimRow {
  age: number
  phase: RetirePhase
  k: number
  s: number
  contrib: number
  growth: number
  withdrawal: number
  total: number
  // income tax on what came out of the pre-tax 401k that year
  tax: number
}
