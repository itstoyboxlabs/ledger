import { getMonths } from '@/shared/utils/getMonths'
import { getLastCompleteMonth } from '@/shared/utils/getLastCompleteMonth'

export function scopeMonthsFor(scope: string): string[] {
  if (scope === 'all') return getMonths()
  if (getMonths().includes(scope)) return [scope]
  const lastComplete = getLastCompleteMonth() ?? ''
  const anchor = getMonths().indexOf(lastComplete) >= 0 ? getMonths().indexOf(lastComplete) : getMonths().length - 1
  if (scope === 'lastMonth') return [getMonths()[anchor] as string]
  if (scope === 'last3') return getMonths().slice(Math.max(0, anchor - 2), anchor + 1)
  if (scope === 'last6') return getMonths().slice(Math.max(0, anchor - 5), anchor + 1)
  if (scope === 'ytd') return getMonths().slice(0, anchor + 1).filter((m) => m.slice(0, 4) === (getMonths()[anchor] as string).slice(0, 4))
  return getMonths()
}
