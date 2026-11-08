import { useCallback, useMemo, useRef, useState } from 'react'
import App from './App'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'
import { Card } from '@/shared/ui/primitives/card'
import { DataContext } from '@/shared/state/DataContext'
import { useData as useDataCtx } from '@/shared/hooks/useData'
import { getStorageMode } from '@/shared/utils/getStorageMode'
import { isLocal } from '@/shared/utils/isLocal'
import { importDataFile } from '@/shared/utils/importDataFile'
import { validateDataFile } from '@/shared/utils/validateDataFile'
import type { DataContextValue } from '@/shared/types/DataContextValue'
import type { NoticeKind } from '@/shared/types/NoticeKind'
import type { DataFile } from '@/shared/types/DataFile'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'

import { hasData } from '@/shared/utils/hasData'
import { getAllTxns } from '@/shared/utils/getAllTxns'



// Owns the "data changed" key. App is keyed on it, so after an import every
// component remounts and re-reads the live bindings in lib/data.js.
export default function Root() {
  const [version, setVersion] = useState(0)
  const [notice, setNotice] = useState<{ text: string; kind: NoticeKind } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = useCallback((text: string, kind: NoticeKind = 'info') => {
    setNotice({ text, kind })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setNotice(null), 7000)
  }, [])

  // texts: [{ text, name }]. Reads every file first so one bad file stops the lot
  // before anything is written, then bumps the version once.
  const importTexts = useCallback(
    async (texts: { text: string; name: string }[], okMessage?: string) => {
      try {
        const parsed = texts.map(({ text, name }): unknown => {
          try {
            return JSON.parse(text)
          } catch {
            throw new Error(`${name} is not valid JSON.`)
          }
        })
        const files: DataFile[] = []
        for (const p of parsed) {
          validateDataFile(p)
          files.push(p)
        }
        let data = false
        let settings = false
        // data files first, then settings, so settings never get overwritten by order
        for (const p of [...files.filter((p) => p.transactions), ...files.filter((p) => !p.transactions)]) {
          const r = await importDataFile(p)
          data ||= r.data
          settings ||= r.settings
        }
        setVersion((v) => v + 1)
        if (okMessage) notify(okMessage)
        else if (data && settings) notify('Loaded your statements and settings.')
        else if (data) notify(`Loaded ${getAllTxns().length.toLocaleString('en-US')} transactions.`)
        else if (hasData()) notify('Settings loaded.')
        else notify('Settings loaded. Now upload ledger-data.json.')
      } catch (e) {
        notify((e instanceof Error && e.message) || 'Could not read that file.', 'error')
      }
    },
    [notify],
  )

  const value = useMemo<DataContextValue>(
    () => ({
      mode: getStorageMode(),
      notify,
      importFiles: async (files: Iterable<File>) =>
        importTexts(await Promise.all([...files].map(async (f) => ({ text: await f.text(), name: f.name })))),
      importSample: async () => {
        try {
          const r = await fetch('/sample-data.json')
          if (!r.ok) throw new Error()
          await importTexts([{ text: await r.text(), name: 'sample-data.json' }], 'Sample data loaded.')
        } catch {
          notify('Could not load the sample data.', 'error')
        }
      },
    }),
    [notify, importTexts],
  )

  return (
    <DataContext.Provider value={value}>
      {hasData() ? <App key={version} /> : <EmptyState />}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[100] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-[var(--surface-3)] py-2.5 pl-4 pr-2.5 text-[13px] shadow-2xl ring-1 ring-[var(--ring)]"
          style={notice.kind === 'error' ? { color: 'var(--bad)' } : undefined}
        >
          <span>{notice.text}</span>
          <Button variant="ghost" size="sm" onClick={() => setNotice(null)}>
            Dismiss
          </Button>
        </div>
      )}
    </DataContext.Provider>
  )
}

function EmptyState() {
  const ctx = useDataCtx()
  if (!ctx) throw new Error('EmptyState must be rendered inside the data provider.')
  const { importFiles, importSample, notify } = ctx
  const fileRef = useRef<HTMLInputElement>(null)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(IMPORT_PROMPT)
      notify('Import prompt copied.')
    } catch {
      notify('Could not copy. Your browser blocked it.', 'error')
    }
  }
  if (isLocal()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
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
      </div>
    )
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[460px] gap-0 p-7">
        <h1 className="text-[26px] font-bold tracking-tight">There's nothing here yet.</h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-[var(--text-secondary)]">
          <li>Download your statements from your bank.</li>
          <li>Give them to an AI assistant (Claude, ChatGPT or Codex) with the import prompt.</li>
          <li>Upload ledger-data.json.</li>
        </ol>
        <p className="mt-3 text-[13px] text-[var(--text-muted)]">
          Have a settings backup too? Upload it with the same button.
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
    </div>
  )
}
