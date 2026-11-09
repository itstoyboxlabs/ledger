import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Download, Upload } from 'lucide-react'
import { Button } from '@/shared/ui/primitives/button'
import { Modal } from '@/shared/ui/Modal'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { copyText } from '@/shared/utils/copyText'
import { downloadImportPrompt } from '@/shared/utils/downloadImportPrompt'

type UploadModalProps = {
  onClose: () => void
  // opens the file picker (the modal closes first)
  onChooseFile: () => void
  // switches to the Getting started tab
  onReadMore: () => void
}

// What the sidebar's Upload file icon opens in browser mode: what an upload replaces, the button
// that opens the file picker and the import prompt for anyone who needs to redo their statements.
export function UploadModal({ onClose, onChooseFile, onReadMore }: UploadModalProps) {
  const [copied, setCopied] = useState<'yes' | 'failed' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const copy = async () => {
    setCopied((await copyText(IMPORT_PROMPT)) ? 'yes' : 'failed')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 2500)
  }
  return (
    <Modal
      onClose={onClose}
      title="Upload your data"
      description="Choose your ledger-data.json to load it. A file replaces the parts it contains: a full export replaces everything on this device, and a statements-only file replaces just your statements and keeps your About you, Balances, Budget, Tools and Retirement setup."
      className="max-w-[460px] p-5"
    >
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button onClick={() => { onClose(); onChooseFile() }}>
          <Upload className="size-4" aria-hidden />
          Choose a file
        </Button>
      </div>
      <section aria-labelledby="upload-redo" className="mt-5 border-t border-[var(--grid)] pt-4">
        <h3 id="upload-redo" className="text-[14px] font-semibold">Need to redo your statements?</h3>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">If you need the prompt again to reprocess your data, here it is.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied === 'yes' ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied === 'yes' ? 'Copied' : 'Copy the prompt'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadImportPrompt}>
            <Download className="size-3.5" aria-hidden />
            Download the prompt
          </Button>
        </div>
        <p role="status" className="mt-2 text-[12px] text-[var(--text-muted)] empty:hidden">
          {copied === 'yes' && 'The prompt is on your clipboard.'}
          {copied === 'failed' && <span className="text-[var(--bad)]">Could not copy. Your browser blocked it, so use Download the prompt instead.</span>}
        </p>
        <Button variant="link" size="xs" onClick={() => { onClose(); onReadMore() }} className="mt-1 h-auto p-0 text-[13px] font-normal">
          Read more on the Getting started page
        </Button>
      </section>
    </Modal>
  )
}
