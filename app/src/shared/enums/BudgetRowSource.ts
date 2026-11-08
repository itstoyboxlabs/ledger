const BudgetRowSource = {
  manual: 'manual',
  subscription: 'subscription',
  tracked: 'tracked',
} as const

type BudgetRowSource = (typeof BudgetRowSource)[keyof typeof BudgetRowSource]

export { BudgetRowSource }
