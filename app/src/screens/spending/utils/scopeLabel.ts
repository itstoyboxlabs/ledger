import { monthLabel } from '@/shared/utils/monthLabel'
import { RANGE_OPTIONS } from '@/shared/constants/RANGE_OPTIONS'

export function scopeLabel(scope: string): string {
  if (scope === 'all') return 'All months'
  return RANGE_OPTIONS.find(([k]) => k === scope)?.[1] ?? monthLabel(scope)
}
