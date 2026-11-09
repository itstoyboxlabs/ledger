import { IMPORT_PROMPT } from '@/shared/constants/IMPORT_PROMPT'
import { downloadBlob } from '@/shared/utils/downloadBlob'

// Saves the import prompt as IMPORT_PROMPT.md, for the Upload modal and the Getting started page.
export function downloadImportPrompt(): void {
  downloadBlob(IMPORT_PROMPT, 'IMPORT_PROMPT.md', 'text/markdown')
}
