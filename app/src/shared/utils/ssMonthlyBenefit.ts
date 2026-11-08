import { SS_BEND_POINTS } from '@/shared/constants/SS_BEND_POINTS'
import { SS_WAGE_BASE } from '@/shared/constants/SS_WAGE_BASE'
import { ssClaimFactor } from '@/shared/utils/ssClaimFactor'

// estimated monthly benefit in today's dollars for a steady yearly salary
export function ssMonthlyBenefit(salary: number | string | undefined, claimAge: number | string | undefined): number {
  const aime = Math.min(Math.max(0, Number(salary) || 0), SS_WAGE_BASE) / 12
  const [b1, b2] = SS_BEND_POINTS
  const pia =
    0.9 * Math.min(aime, b1) +
    0.32 * Math.max(0, Math.min(aime, b2) - b1) +
    0.15 * Math.max(0, aime - b2)
  return pia * ssClaimFactor(claimAge)
}
