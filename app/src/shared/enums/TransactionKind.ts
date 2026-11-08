const TransactionKind = {
  expense: 'expense',
  income: 'income',
  refund: 'refund',
  transfer: 'transfer',
} as const

type TransactionKind = (typeof TransactionKind)[keyof typeof TransactionKind]

export { TransactionKind }
