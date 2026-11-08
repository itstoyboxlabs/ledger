import { buildExport } from '@/shared/utils/buildExport'
import { downloadBlob } from '@/shared/utils/downloadBlob'

export async function downloadExport() {
  const file = await buildExport()
  downloadBlob(JSON.stringify(file, null, 2), 'ledger-settings.json', 'application/json')
}
