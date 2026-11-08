import { monthOf } from '@/shared/utils/monthOf'
import type { Transaction } from '@/shared/types/Transaction'

// every transaction (any kind) in the given months and on the switched-on accounts
export function scopedTxns(txns: Transaction[], months: string[], accounts: string[]): Transaction[] {
  const inMonths = new Set(months)
  const inAccounts = new Set(accounts)
  return txns.filter((t) => inMonths.has(monthOf(t)) && inAccounts.has(t.account))
}
