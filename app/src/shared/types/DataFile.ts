import type { ExportSettings } from '@/shared/types/ExportSettings'
import type { Merchants } from '@/shared/types/Merchants'
import type { Periods } from '@/shared/types/Periods'
import type { RawAccounts } from '@/shared/types/RawAccounts'
import type { Subscription } from '@/shared/types/Subscription'
import type { Transaction } from '@/shared/types/Transaction'

// A ledger file as read from disk: ledger-data.json, ledger-settings.json, or both in one.
export interface DataFile {
  version: 1
  exportedAt?: string
  updated?: string
  notes?: string[]
  accounts?: RawAccounts
  merchants?: Merchants
  periods?: Periods
  subscriptions?: Subscription[]
  transactions?: Transaction[]
  settings?: ExportSettings
}
