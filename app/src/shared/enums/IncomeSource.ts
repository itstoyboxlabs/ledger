const IncomeSource = {
  statements: 'statements',
  tool: 'tool',
  manual: 'manual',
} as const

type IncomeSource = (typeof IncomeSource)[keyof typeof IncomeSource]

export { IncomeSource }
