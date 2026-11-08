const StockType = {
  nso: 'nso',
  iso: 'iso',
  rsu: 'rsu',
} as const

type StockType = (typeof StockType)[keyof typeof StockType]

export { StockType }
