import { httpPost } from '@/shared/utils/httpPost'
import { idbSet } from '@/shared/utils/idbSet'
import { isLocal } from '@/shared/utils/isLocal'
import type { LogEntry } from '@/shared/types/LogEntry'

export async function saveLog(entries: LogEntry[]): Promise<void> {
  if (isLocal()) return httpPost('/api/log', { entries })
  return idbSet('log', { entries })
}
