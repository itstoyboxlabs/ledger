import { dataStore } from '@/shared/state/dataStore'
import { normalizeAccounts } from '@/shared/utils/normalizeAccounts'
import { monthOf } from '@/shared/utils/monthOf'
import { isMonthComplete } from '@/shared/utils/isMonthComplete'
import type { RawTransactionsData } from '@/shared/types/RawTransactionsData'

// Replaces everything the app shows with a loaded data file.
export function applyData(raw: RawTransactionsData): void {
  const transactions = raw.transactions ?? []
  dataStore.setState({
    accounts: normalizeAccounts(raw.accounts),
    merchants: raw.merchants ?? {},
    periods: raw.periods ?? {},
    subscriptions: raw.subscriptions ?? [],
    transactions,
    months: [...new Set(transactions.map(monthOf))].sort(),
  })
  // isMonthComplete reads the accounts and periods set above
  const months = dataStore.getState().months
  dataStore.setState({ lastCompleteMonth: [...months].reverse().find(isMonthComplete) ?? months[months.length - 1] })
}
