import { buildExport } from '@/shared/utils/buildExport'
import { downloadBlob } from '@/shared/utils/downloadBlob'

// Export data: saves everything to one ledger-data.json, the same file the user uploads and gives their assistant.
export async function downloadExport() {
  const file = await buildExport()
  downloadBlob(JSON.stringify(file, null, 2), 'ledger-data.json', 'application/json')
}
