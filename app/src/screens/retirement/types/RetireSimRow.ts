import type { RetirePhase } from '@/screens/retirement/types/RetirePhase'

// One year of the projection.
export interface RetireSimRow {
  age: number
  phase: RetirePhase
  // gross pay that year, 0 when not working
  pay: number
  k: number
  s: number
  contrib: number
  growth: number
  withdrawal: number
  total: number
}
