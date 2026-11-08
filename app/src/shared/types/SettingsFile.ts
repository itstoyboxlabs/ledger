import type { ExportSettings } from '@/shared/types/ExportSettings'

// What buildExport() writes: the settings only, no statements.
export interface SettingsFile {
  version: 1
  exportedAt: string
  settings: ExportSettings
}
