import { derivedMonthlyIncome } from '@/shared/utils/derivedMonthlyIncome'
import { incomeSourceOf } from '@/shared/utils/incomeSourceOf'
import { takeHomeMonthly } from '@/shared/utils/takeHomeMonthly'
import type { IncomeOverride } from '@/shared/types/IncomeOverride'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

export function budgetIncomeFor(ov: IncomeOverride | undefined, th: RawTakeHome, taxState: string): number {
  const source = incomeSourceOf(ov)
  if (source === 'manual') return Number(ov?.amount) || 0
  if (source === 'tool') return takeHomeMonthly(th, taxState)
  return derivedMonthlyIncome()
}
