import { isMonthComplete } from '@/shared/utils/isMonthComplete'
import { monthLabel } from '@/shared/utils/monthLabel'

export function monthCompareLabel(ym: string): string {
  return isMonthComplete(ym) ? monthLabel(ym) : `${monthLabel(ym)} · partial`
}
