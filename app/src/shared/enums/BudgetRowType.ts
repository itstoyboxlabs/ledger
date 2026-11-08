const BudgetRowType = {
  simple: 'simple',
  breakdown: 'breakdown',
} as const

type BudgetRowType = (typeof BudgetRowType)[keyof typeof BudgetRowType]

export { BudgetRowType }
