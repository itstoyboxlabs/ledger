import { useRef } from 'react'
import { Button } from '@/shared/ui/primitives/button'
import { Card } from '@/shared/ui/primitives/card'
import { Input } from '@/shared/ui/primitives/input'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { useData } from '@/shared/hooks/useData'
import { isLocal } from '@/shared/utils/isLocal'
import { copyText } from '@/shared/utils/copyText'

// What Root shows before any statements are loaded: how to import them in local mode, or the
// upload, copy prompt and sample data buttons in the browser.
export function EmptyState() {
  const ctx = useData()
  if (!ctx) throw new Error('EmptyState must be rendered inside the data provider.')
  const { importFiles, importSample, notify } = ctx
  const fileRef = useRef<HTMLInputElement>(null)
  const copy = async () => {
    if (await copyText(IMPORT_PROMPT)) notify('Import prompt copied.')
    else notify('Could not copy. Your browser blocked it.', 'error')
  }
  if (isLocal()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <Card className="w-full max-w-[460px] gap-0 p-7">
          <h1 className="text-[26px] font-bold tracking-tight">No statements yet.</h1>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <li>Put your bank statements in the statements folder of this project.</li>
            <li>Tell your coding assistant (Claude Code or Codex) to import them. It follows the rules in CLAUDE.md and writes data/transactions.json.</li>
            <li>Refresh this page.</li>
          </ol>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button variant="outline" onClick={copy}>Copy import prompt</Button>
          </div>
        </Card>
      </main>
    )
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[460px] gap-0 p-7">
        <h1 className="text-[26px] font-bold tracking-tight">There's nothing here yet.</h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-[var(--text-secondary)]">
          <li>Download your statements from your bank.</li>
          <li>Give them to an AI assistant (Claude, ChatGPT or Codex) with the import prompt.</li>
          <li>Upload the ledger-data.json file it gives you.</li>
        </ol>
        <p className="mt-3 text-[13px] text-[var(--text-muted)]">
          Used Ledger before? Upload the last ledger-data.json you exported. It has your statements and settings, and it replaces what is stored on this device.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = [...(e.target.files ?? [])]
              e.target.value = ''
              if (files.length) importFiles(files)
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>Upload ledger-data.json</Button>
          <Button variant="outline" onClick={copy}>Copy import prompt</Button>
          <Button variant="ghost" onClick={importSample}>Try it with sample data</Button>
        </div>
      </Card>
    </main>
  )
}
