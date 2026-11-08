import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { EmptyState } from './EmptyState'

afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  vi.restoreAllMocks()
})

describe('EmptyState', () => {
  it('offers upload, the import prompt and sample data in the browser', async () => {
    const importSample = vi.fn(async () => {})
    renderApp(<EmptyState />, { context: { importSample } })
    expect(screen.getByRole('heading', { level: 1, name: "There's nothing here yet." })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload ledger-data.json' })).toBeInTheDocument()
    expect(screen.getByText(/Upload the last ledger-data.json you exported/)).toBeInTheDocument()
    expect(screen.queryByText(/settings backup/)).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Try it with sample data' }))
    expect(importSample).toHaveBeenCalled()
  })

  it('sends picked files to the importer', async () => {
    const importFiles = vi.fn(async () => {})
    const { container } = renderApp(<EmptyState />, { context: { importFiles } })
    const file = new File(['{}'], 'ledger-data.json', { type: 'application/json' })
    await userEvent.upload(container.querySelector('input[type="file"]') as HTMLInputElement, file)
    expect(importFiles).toHaveBeenCalledWith([file])
  })

  it('explains the folder workflow in local mode, with no upload', () => {
    storageModeStore.setState({ mode: 'local' })
    renderApp(<EmptyState />)
    expect(screen.getByRole('heading', { level: 1, name: 'No statements yet.' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Upload ledger-data.json' })).toBeNull()
  })

  it('copies the import prompt and says so', async () => {
    const notify = vi.fn()
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    renderApp(<EmptyState />, { context: { notify } })
    await user.click(screen.getByRole('button', { name: 'Copy import prompt' }))
    expect(write).toHaveBeenCalledWith(IMPORT_PROMPT)
    expect(notify).toHaveBeenCalledWith('Import prompt copied.')
  })
})
