import type { BudgetFile } from '@/shared/types/BudgetFile'
import type { LogEntry } from '@/shared/types/LogEntry'
import type { LogFile } from '@/shared/types/LogFile'
import type { Note } from '@/shared/types/Note'
import type { NotesFile } from '@/shared/types/NotesFile'
import type { Presets } from '@/shared/types/Presets'

// The `settings` block of a ledger file. Notes and log may be a bare list or the wrapped file shape.
export interface ExportSettings {
  budget?: BudgetFile | null
  notes?: NotesFile | Note[] | null
  presets?: Presets | null
  log?: LogFile | LogEntry[] | null
  local?: Record<string, unknown>
}
