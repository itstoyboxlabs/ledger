import type { IncomeOverride } from '@/shared/types/IncomeOverride'
// Where the Budget page's monthly income comes from. Saved as `budgetIncomeOverride`:
// { active: false } is your statements (average paycheck times 2), { active: true } is
// the Take-home tool's figure, { active: 'manual', amount } is a number you typed.
export const INCOME_OVERRIDE_DEFAULTS: IncomeOverride = { active: false, amount: 0 }
