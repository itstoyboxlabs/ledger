import type { TransactionKind } from '@/shared/enums/TransactionKind'

// One line from a statement. `partial` marks a short first paycheck (left out of the income average).
export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  account: string // key in Accounts
  statement?: string // key in Periods
  desc?: string
  merchant?: string
  amount: number
  kind: TransactionKind
  cat?: string
  sub?: string
  partial?: boolean
  note?: string
}
