import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportModal } from './ExportModal'
import { downloadExport } from '@/shared/utils/downloadExport'
import { storageModeStore } from '@/shared/state/storageModeStore'

vi.mock('@/shared/utils/downloadExport', () => ({ downloadExport: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  storageModeStore.setState({ mode: 'browser' })
})
afterEach(() => storageModeStore.setState({ mode: 'browser' }))

describe('ExportModal', () => {
  it('describes the browser-mode export', () => {
    render(<ExportModal onClose={() => {}} notify={() => {}} />)
    expect(screen.getByText('Export data')).toBeInTheDocument()
    expect(screen.getByText(/Saves everything to one file, ledger-data.json/)).toBeInTheDocument()
    expect(screen.getByText(/give it to your assistant with your new statements/)).toBeInTheDocument()
  })

  it('describes the local-mode export', () => {
    storageModeStore.setState({ mode: 'local' })
    render(<ExportModal onClose={() => {}} notify={() => {}} />)
    expect(screen.getByText(/already lives in the data folder/)).toBeInTheDocument()
    expect(screen.getByText(/to one file, ledger-data.json/)).toBeInTheDocument()
  })

  it('downloads then closes', async () => {
    const onClose = vi.fn()
    render(<ExportModal onClose={onClose} notify={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Download' }))
    expect(downloadExport).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('notifies and stays open when the export fails', async () => {
    vi.mocked(downloadExport).mockRejectedValueOnce(new Error('x'))
    const onClose = vi.fn()
    const notify = vi.fn()
    render(<ExportModal onClose={onClose} notify={notify} />)
    await userEvent.click(screen.getByRole('button', { name: 'Download' }))
    expect(notify).toHaveBeenCalledWith('Could not build the export file.', 'error')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Close button closes', async () => {
    const onClose = vi.fn()
    render(<ExportModal onClose={onClose} notify={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})
