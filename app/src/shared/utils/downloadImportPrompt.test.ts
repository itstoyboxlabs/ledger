import { downloadImportPrompt } from './downloadImportPrompt'
import { downloadBlob } from '@/shared/utils/downloadBlob'
import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'

vi.mock('@/shared/utils/downloadBlob', () => ({ downloadBlob: vi.fn() }))

describe('downloadImportPrompt', () => {
  it('downloads the prompt as a markdown file', () => {
    downloadImportPrompt()
    expect(downloadBlob).toHaveBeenCalledWith(IMPORT_PROMPT, 'IMPORT_PROMPT.md', 'text/markdown')
  })
})
