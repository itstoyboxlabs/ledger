const DeductionUnit = {
  pct: 'pct',
  mo: 'mo',
  yr: 'yr',
} as const

type DeductionUnit = (typeof DeductionUnit)[keyof typeof DeductionUnit]

export { DeductionUnit }
