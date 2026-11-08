import { getPeriods } from '@/shared/utils/getPeriods'

// latest statement coverage end for an account (YYYY-MM-DD)
export function coverageEnd(account: string): string | undefined {
  return Object.values(getPeriods())
    .filter((p) => p.account === account)
    .map((p) => p.end)
    .sort()
    .pop()
}
