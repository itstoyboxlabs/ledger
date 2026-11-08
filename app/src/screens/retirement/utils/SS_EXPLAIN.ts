import { fmt0 } from '@/shared/utils/fmt0'
import { SS_BEND_POINTS } from '@/shared/constants/SS_BEND_POINTS'
import { SS_WAGE_BASE } from '@/shared/constants/SS_WAGE_BASE'

// plain-language explanation of the Social Security estimate, shown on hover
export const SS_EXPLAIN = (salary: number, claimAge: number | string, monthly: number): string =>
  `Social Security averages your 35 best years of earnings into a monthly figure, then pays about 90% of the first ${fmt0(SS_BEND_POINTS[0])} of it, 32% of the next ${fmt0(SS_BEND_POINTS[1] - SS_BEND_POINTS[0])} and 15% of anything above that. Only pay up to ${fmt0(SS_WAGE_BASE)} a year counts. Then it is adjusted for the age you claim. This estimate assumes ${fmt0(salary)} a year (your Take-home salary) for 35 years and claiming at ${Math.min(70, Math.max(62, Number(claimAge) || 67))}, which comes to ${fmt0(monthly)} a month. For the real number, check your statement at ssa.gov and type it in.`
