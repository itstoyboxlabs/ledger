import { mergeStatements } from '@/shared/utils/mergeStatements'
import type { DataFile } from '@/shared/types/DataFile'
import type { ExportSettings } from '@/shared/types/ExportSettings'
import type { TransactionsData } from '@/shared/types/TransactionsData'

// Several files uploaded at once become one before they replace what is stored. Files with transactions
// go first and settings files last, so a settings backup always wins over settings inside a data file.
// Statements combine as in mergeStatements; each settings section comes from the last file that has it.
export function combineDataFiles(files: DataFile[]): DataFile {
  const ordered = [...files.filter((f) => f.transactions), ...files.filter((f) => !f.transactions)]
  let statements: TransactionsData | null = null
  let settings: ExportSettings | null = null
  for (const f of ordered) {
    if (Array.isArray(f.transactions)) {
      statements = mergeStatements(statements ?? { accounts: {}, merchants: {}, periods: {}, subscriptions: [], transactions: [] }, f)
    }
    if (f.settings) {
      const prev: ExportSettings = settings ?? {}
      const local: ExportSettings['local'] = f.settings.local ? { ...prev.local, ...f.settings.local } : prev.local
      settings = { ...prev, ...f.settings, ...(local ? { local } : {}) }
    }
  }
  return { version: 1, ...statements, ...(settings ? { settings } : {}) }
}
