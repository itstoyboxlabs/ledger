import type { Accounts } from '@/shared/types/Accounts'
import type { Merchants } from '@/shared/types/Merchants'
import type { Periods } from '@/shared/types/Periods'
import type { Subscription } from '@/shared/types/Subscription'
import type { Transaction } from '@/shared/types/Transaction'

// The statements part of a data file as the app keeps it (data/transactions.json, or IndexedDB in browser mode).
export interface TransactionsData {
  accounts: Accounts
  merchants: Merchants
  periods: Periods
  subscriptions: Subscription[]
  transactions: Transaction[]
}
