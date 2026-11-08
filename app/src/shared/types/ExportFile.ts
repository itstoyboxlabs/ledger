import type { DataFile } from '@/shared/types/DataFile'
import type { ExportSettings } from '@/shared/types/ExportSettings'

// What buildExport() writes: one ledger-data.json with the statements and the settings together,
// the same shape as public/sample-data.json. Statements are missing only when none are stored.
export interface ExportFile extends DataFile {
  exportedAt: string
  settings: ExportSettings
}
