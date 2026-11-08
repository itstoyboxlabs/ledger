import type { RetireSimRow } from '@/screens/retirement/types/RetireSimRow'

export interface RetireSimResult {
  rows: RetireSimRow[]
  runOutAge: number | null
  atRetirement: { liquid: number; locked: number } | null
}
