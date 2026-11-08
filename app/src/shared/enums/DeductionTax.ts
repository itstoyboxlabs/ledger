const DeductionTax = {
  income: 'income',
  all: 'all',
  none: 'none',
} as const

type DeductionTax = (typeof DeductionTax)[keyof typeof DeductionTax]

export { DeductionTax }
