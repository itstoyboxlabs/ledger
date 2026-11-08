import type { Debt } from '@/shared/types/Debt'

// What a Balances preset saves: the debts, without the one-time link hint. Presets saved before the tax state
// moved to About you may still carry a `taxState`; it is ignored on apply and dropped on the next save.
export interface PlanningPreset {
  debts: Omit<Debt, 'linkName'>[]
}
