import { takeHomeBreakdown } from '@/shared/utils/takeHomeBreakdown'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

export function takeHomeMonthly(th: RawTakeHome, taxState: string, filing: FilingStatus = FilingStatus.single): number {
  return takeHomeBreakdown(th, taxState, filing).net / 12
}
