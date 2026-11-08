import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

export function takeHomeMonthly(th: RawTakeHome, taxState: string): number {
  return takeHomeBreakdown(th, taxState).net / 12
}
