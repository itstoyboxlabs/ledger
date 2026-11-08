import { create } from 'zustand'
import type { DataStoreState } from '@/shared/types/DataStoreState'

// The statements the app is showing. Transactions are not bundled: main.jsx loads them at startup (local mode:
// the dev server's /api/transactions, browser mode: IndexedDB) and calls applyData(), which fills this store.
// Read it with the getAccounts(), getAllTxns() ... functions. The root bumps a React key after an import,
// so every component re-reads them.
export const dataStore = create<DataStoreState>()(() => ({
  accounts: {},
  merchants: {},
  periods: {},
  subscriptions: [],
  transactions: [],
  months: [],
  lastCompleteMonth: undefined,
}))
