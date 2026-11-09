import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadModal } from './UploadModal'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { copyText } from '@/shared/utils/copyText'
import { downloadImportPrompt } from '@/shared/utils/downloadImportPrompt'

vi.mock('@/shared/utils/copyText', () => ({ copyText: vi.fn() }))
vi.mock('@/shared/utils/downloadImportPrompt', () => ({ downloadImportPrompt: vi.fn() }))

const setup = () => {
  const fns = { onClose: vi.fn(), onChooseFile: vi.fn(), onReadMore: vi.fn() }
  render(<UploadModal {...fns} />)
  return fns
}

describe('UploadModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('is a dialog that says what an upload replaces', () => {
    setup()
    const dialog = screen.getByRole('dialog', { name: 'Upload your data' })
    expect(dialog).toHaveAccessibleDescription(/a statements-only file replaces just your statements/)
    expect(screen.getByRole('heading', { name: 'Need to redo your statements?' })).toBeInTheDocument()
  })

  it('Choose a file closes the modal and opens the picker', async () => {
    const { onClose, onChooseFile } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Choose a file' }))
    expect(onClose).toHaveBeenCalled()
    expect(onChooseFile).toHaveBeenCalled()
  })

  it('copies the prompt and says so', async () => {
    vi.mocked(copyText).mockResolvedValue(true)
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Copy the prompt' }))
    expect(copyText).toHaveBeenCalledWith(IMPORT_PROMPT)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('downloads the prompt', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Download the prompt' }))
    expect(downloadImportPrompt).toHaveBeenCalled()
  })

  it('links to Getting started', async () => {
    const { onClose, onReadMore } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Read more on the Getting started page' }))
    expect(onClose).toHaveBeenCalled()
    expect(onReadMore).toHaveBeenCalled()
  })
})
