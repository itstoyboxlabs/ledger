import { MILESTONE_AGES } from '@/screens/retirement/constants/MILESTONE_AGES'

// The balance at a few milestone ages plus the end age, only the ones the projection reaches.
export function milestoneBalances(rows: { age: number; total: number }[], age: number, endAge: number): { age: number; total: number }[] {
  return [...new Set([...MILESTONE_AGES, endAge])]
    .sort((a, b) => a - b)
    .filter((a) => a > age && a <= endAge)
    .map((a) => ({ age: a, total: rows.find((r) => r.age === a)?.total ?? 0 }))
}
