import { SS_EARLIEST_CLAIM_AGE } from '@/shared/constants/SS_EARLIEST_CLAIM_AGE'
import { SS_FULL_RETIREMENT_AGE } from '@/shared/constants/SS_FULL_RETIREMENT_AGE'
import { SS_LATEST_CLAIM_AGE } from '@/shared/constants/SS_LATEST_CLAIM_AGE'

// Share of the full benefit paid at a claim age, for a full retirement age of 67 (born 1960 or
// later). Source: SSA, "Early or Late Retirement?" (https://www.ssa.gov/oact/quickcalc/early_late.html).
// Claiming early cuts 5/9 of 1% a month for the first 36 months before 67 and 5/12 of 1% a month
// beyond that, so 62 pays 70%, 64 pays 80% and 65 about 86.7%. Waiting past 67 adds 8% a year,
// so 70 pays 124%. Clamped to 62 to 70.
export function ssClaimFactor(claimAge: number | string | undefined): number {
  const a = Math.min(SS_LATEST_CLAIM_AGE, Math.max(SS_EARLIEST_CLAIM_AGE, Number(claimAge) || SS_FULL_RETIREMENT_AGE))
  if (a >= SS_FULL_RETIREMENT_AGE) return 1 + (a - SS_FULL_RETIREMENT_AGE) * 0.08
  const months = (SS_FULL_RETIREMENT_AGE - a) * 12
  return 1 - Math.min(36, months) * (5 / 900) - Math.max(0, months - 36) * (5 / 1200)
}
