import { httpGet } from '@/shared/utils/httpGet'
import { idbGet } from '@/shared/utils/idbGet'
import { isLocal } from '@/shared/utils/isLocal'
import type { NotesFile } from '@/shared/types/NotesFile'

/* ---------- notes { notes: [] } ---------- */

export async function getNotes(): Promise<NotesFile> {
  if (isLocal()) return httpGet<NotesFile>('/api/notes')
  return (await idbGet<NotesFile>('notes')) ?? { notes: [] }
}
