import type { Debt } from '@/shared/types/Debt'

// What a "planning variables" preset saves: the tax state and the debts (without the one-time link hint).
export interface PlanningPreset {
  taxState: string
  debts: Omit<Debt, 'linkName'>[]
}
