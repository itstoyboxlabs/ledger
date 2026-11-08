import { isObj } from '@/shared/utils/isObj'
// One-time move of the employer match from Retirement to the Take-home tool. Old
// `retireCalc` saves carried it as `match401k` (or, before that field existed, the code
// assumed 100). If the saved Take-home deductions have never had a `match`, copy that
// percent onto the 401k deductions. Runs at load, before anything reads the keys, and
// then `match401k` is ignored everywhere.
export function legacyMatchPct(raw: unknown): number {
  if (!isObj(raw)) return 0
  if (typeof raw.match401k === 'number') return raw.match401k
  return Array.isArray(raw.events) ? 0 : 100
}
