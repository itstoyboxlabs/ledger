import type { AgeEntry } from '@/shared/types/AgeEntry'

// the age today: the typed age plus one for every January since it was typed. Never less
// than the typed age, so a clock set to an earlier year does not make you younger.
export function currentAge(entry: AgeEntry | null | undefined, year: number = new Date().getFullYear()): number | null {
  if (!entry) return null
  return entry.age + Math.max(0, year - entry.asOf)
}
