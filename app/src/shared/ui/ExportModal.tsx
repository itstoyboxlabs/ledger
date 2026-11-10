import { track } from '@/shared/utils/track'
import { isLocal } from '@/shared/utils/isLocal'
import { downloadExport } from '@/shared/utils/downloadExport'
import { Button } from '@/shared/ui/primitives/button'

import { Modal } from '@/shared/ui/Modal'
import type { NoticeKind } from '@/shared/types/NoticeKind'

type ExportModalProps = { onClose: () => void; notify: (message: string, kind?: NoticeKind) => void }

export function ExportModal({ onClose, notify }: ExportModalProps) {
  const local = isLocal()
  return (
    <Modal
      onClose={onClose}
      title="Export data"
      description={
        local
          ? 'Your data already lives in the data folder of this project, so exporting is optional. It saves your statements, budget and settings to one file, ledger-data.json, as a backup.'
          : 'Saves everything to one file, ledger-data.json: your statements, budget and settings. Keep it as a backup. Next month, give it to your assistant with your new statements and upload the file it gives back.'
      }
      className="max-w-[420px] p-5"
    >
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button
          onClick={async () => {
            try {
              await downloadExport()
              track('export_downloaded')
              onClose()
            } catch {
              notify('Could not build the export file.', 'error')
            }
          }}
        >
          Download
        </Button>
      </div>
    </Modal>
  )
}
