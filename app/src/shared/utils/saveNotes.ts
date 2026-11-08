import { httpPost } from '@/shared/utils/httpPost'
import { idbSet } from '@/shared/utils/idbSet'
import { isLocal } from '@/shared/utils/isLocal'
import type { Note } from '@/shared/types/Note'

export async function saveNotes(notes: Note[]): Promise<void> {
  if (isLocal()) return httpPost('/api/notes', { notes })
  return idbSet('notes', { notes })
}
