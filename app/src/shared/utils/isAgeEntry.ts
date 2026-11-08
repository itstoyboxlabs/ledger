import { isObj } from '@/shared/utils/isObj'
import type { AgeEntry } from '@/shared/types/AgeEntry'

// true for a saved About you age: a whole age from 0 to 120 and a plausible year
export function isAgeEntry(v: unknown): v is AgeEntry {
  if (!isObj(v)) return false
  const { age, asOf } = v as Record<string, unknown>
  return typeof age === 'number' && Number.isInteger(age) && age >= 0 && age <= 120
    && typeof asOf === 'number' && Number.isInteger(asOf) && asOf >= 1900 && asOf <= 3000
}
