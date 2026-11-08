import { httpGet } from '@/shared/utils/httpGet'
import { idbGet } from '@/shared/utils/idbGet'
import { isLocal } from '@/shared/utils/isLocal'
import type { LogFile } from '@/shared/types/LogFile'

/* ---------- spending log { entries: [] } ---------- */

export async function getLog(): Promise<LogFile> {
  if (isLocal()) return httpGet<LogFile>('/api/log')
  return (await idbGet<LogFile>('log')) ?? { entries: [] }
}
