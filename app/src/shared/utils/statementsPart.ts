import { mergeStatements } from '@/shared/utils/mergeStatements'
import type { DataFile } from '@/shared/types/DataFile'
import type { RawTransactionsData } from '@/shared/types/RawTransactionsData'
import type { StoredStatements } from '@/shared/types/StoredStatements'

const NOT_STATEMENTS = new Set(['version', 'exportedAt', 'settings'])

// The statements part of a ledger file: everything except version, exportedAt and settings. Sections
// are cleaned up as in mergeStatements (accounts upgraded, transactions sorted), and other top-level
// fields such as `updated` and `notes` are kept as they are, in the order the file has them.
export function statementsPart(f: DataFile | RawTransactionsData): StoredStatements {
  const rest = Object.fromEntries(Object.entries(f).filter(([k]) => !NOT_STATEMENTS.has(k)))
  return { ...rest, ...mergeStatements({ accounts: {}, merchants: {}, periods: {}, subscriptions: [], transactions: [] }, f) }
}
