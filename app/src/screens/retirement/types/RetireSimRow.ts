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
}
