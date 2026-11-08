import type { RetireSimRow } from '@/screens/retirement/types/RetireSimRow'

export interface RetireSimResult {
  rows: RetireSimRow[]
  runOutAge: number | null
  atRetirement: { liquid: number; locked: number } | null
  // the monthly Social Security used (from the pay plan when it sets it)
  ssMonthly: number
}
