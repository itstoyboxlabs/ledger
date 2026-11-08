import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import { isDismissedSub } from '@/shared/utils/isDismissedSub'
import { liveSubAmount } from '@/shared/utils/liveSubAmount'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { DismissedSubs } from '@/shared/types/DismissedSubs'
import type { EffectiveBudgetRow } from '@/shared/types/EffectiveBudgetRow'
import { BudgetRowSource } from '@/shared/enums/BudgetRowSource'

export function budgetEffRows(rows: BudgetRow[], dismissed: DismissedSubs | undefined): EffectiveBudgetRow[] {
  const isBudgetSub = (name: string): boolean => getSubscriptions().find((s) => s.name === name)?.cadence !== 'annual'
  const knownSubNames = new Set(rows.map((r) => r.name))
  return [
    ...rows
      .filter((r) => r.source !== 'subscription' || (isBudgetSub(r.name) && !isDismissedSub(dismissed, r.name)))
      .map((r) =>
        r.source === 'subscription' ? { ...r, amount: liveSubAmount(r), hidden: false } : r,
      ),
    ...getSubscriptions().filter(
      (s) => !knownSubNames.has(s.name) && s.cadence !== 'annual' && !isDismissedSub(dismissed, s.name),
    ).map((s) => ({
      id: `sub-live-${s.name}`,
      name: s.name,
      amount: liveSubAmount({ name: s.name, source: 'subscription' }),
      source: BudgetRowSource.subscription,
      __unsaved: true, // exists only in transactions.json, no budget.json row
    })),
  ]
}
