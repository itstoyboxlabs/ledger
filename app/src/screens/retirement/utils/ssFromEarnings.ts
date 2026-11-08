import { SS_WAGE_BASE } from '@/shared/constants/SS_WAGE_BASE'
import { ssMonthlyBenefit } from '@/shared/utils/ssMonthlyBenefit'

// Monthly Social Security from a list of yearly earnings: each year capped at the wage
// base, the best 35 averaged (missing years count as zero), then the usual formula.
export function ssFromEarnings(earnings: number[], claimAge: number): number {
  const best = earnings
    .map((e) => Math.min(Math.max(0, Number(e) || 0), SS_WAGE_BASE))
    .sort((a, b) => b - a)
    .slice(0, 35)
  const avg = best.reduce((t, e) => t + e, 0) / 35
  return ssMonthlyBenefit(avg, claimAge)
}
