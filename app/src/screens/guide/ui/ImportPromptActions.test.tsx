import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportPromptActions } from './ImportPromptActions'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { downloadImportPrompt } from '@/shared/utils/downloadImportPrompt'
import { copyText } from '@/shared/utils/copyText'

vi.mock('@/shared/utils/downloadImportPrompt', () => ({ downloadImportPrompt: vi.fn() }))
vi.mock('@/shared/utils/copyText', () => ({ copyText: vi.fn() }))

describe('ImportPromptActions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('copies the import prompt and says so', async () => {
    vi.mocked(copyText).mockResolvedValue(true)
    render(<ImportPromptActions />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy the prompt' }))
    expect(copyText).toHaveBeenCalledWith(IMPORT_PROMPT)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('The prompt is on your clipboard.')
  })

  it('points to the download when copying is blocked', async () => {
    vi.mocked(copyText).mockResolvedValue(false)
    render(<ImportPromptActions />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy the prompt' }))
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy')
  })

  it('downloads IMPORT_PROMPT.md as markdown', async () => {
    render(<ImportPromptActions />)
    await userEvent.click(screen.getByRole('button', { name: 'Download the prompt' }))
    expect(downloadImportPrompt).toHaveBeenCalled()
  })

  it('shows and hides the prompt text', async () => {
    render(<ImportPromptActions />)
    const toggle = screen.getByRole('button', { name: 'Show the prompt' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('The import prompt')).not.toBeInTheDocument()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Hide the prompt')
    const pre = screen.getByLabelText('The import prompt')
    expect(pre.id).toBe(toggle.getAttribute('aria-controls'))
    expect(pre.textContent).toBe(IMPORT_PROMPT)
    await userEvent.click(toggle)
    expect(screen.queryByLabelText('The import prompt')).not.toBeInTheDocument()
  })
})
