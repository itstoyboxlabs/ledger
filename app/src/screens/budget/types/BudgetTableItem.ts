import type { EffectiveBudgetRow } from '@/shared/types/EffectiveBudgetRow'
import type { GhostRow } from '@/screens/budget/types/GhostRow'

// One entry in the budget table body: a real row, a ghost row, a section marker, or null for the Subscriptions header.
export type BudgetTableItem = EffectiveBudgetRow | GhostRow | 'ghost-header' | 'ghost-total' | null
