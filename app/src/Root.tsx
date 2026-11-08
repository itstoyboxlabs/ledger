import { useCallback, useMemo, useRef, useState } from 'react'
import App from './App'
import { Button } from '@/shared/ui/primitives/button'
import { DataContext } from '@/shared/state/DataContext'
import { getStorageMode } from '@/shared/utils/getStorageMode'
import { importDataFile } from '@/shared/utils/importDataFile'
import { validateDataFile } from '@/shared/utils/validateDataFile'
import type { DataContextValue } from '@/shared/types/DataContextValue'
import type { NoticeKind } from '@/shared/types/NoticeKind'
import type { DataFile } from '@/shared/types/DataFile'
import { hasData } from '@/shared/utils/hasData'
import { getAllTxns } from '@/shared/utils/getAllTxns'
import { EmptyState } from '@/shared/ui/EmptyState'

// Owns the "data changed" key. App is keyed on it, so after an import every
// component remounts and re-reads the data store.
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
