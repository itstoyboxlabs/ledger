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
          ? 'Your settings already live in the data folder of this project. Exporting is optional. It saves your budget and settings to a file as a backup.'
          : 'Saves your budget and settings. Your statements stay in the ledger-data.json file your assistant made. If you clear your browser, upload both files again.'
      }
      className="max-w-[420px] p-5"
    >
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button
          onClick={async () => {
            try {
              await downloadExport()
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
