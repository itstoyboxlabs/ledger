import { mergeStatements } from '@/shared/utils/mergeStatements'
import { statementsPart } from '@/shared/utils/statementsPart'
import type { DataFile } from '@/shared/types/DataFile'
import type { ExportSettings } from '@/shared/types/ExportSettings'
import type { StoredStatements } from '@/shared/types/StoredStatements'

// Several files uploaded at once become one before they replace what is stored. Today one file holds
// everything, but older backups split the settings into a second file (ledger-settings.json), and people
// may still pick both. Files with transactions go first and settings-only files last, so an old settings
// backup wins over settings inside a data file. Statements combine as in mergeStatements, other top-level
// fields such as `updated` come from the last data file, and each settings section from the last file that has it.
export function combineDataFiles(files: DataFile[]): DataFile {
  const ordered = [...files.filter((f) => f.transactions), ...files.filter((f) => !f.transactions)]
  let statements: StoredStatements | null = null
  let settings: ExportSettings | null = null
  for (const f of ordered) {
    if (Array.isArray(f.transactions)) {
      statements = { ...(statements ?? {}), ...statementsPart(f), ...(statements ? mergeStatements(statements, f) : {}) }
    }
    if (f.settings) {
      const prev: ExportSettings = settings ?? {}
      const local: ExportSettings['local'] = f.settings.local ? { ...prev.local, ...f.settings.local } : prev.local
      settings = { ...prev, ...f.settings, ...(local ? { local } : {}) }
    }
  }
  return { version: 1, ...statements, ...(settings ? { settings } : {}) }
}
