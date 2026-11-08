import type { NoticeKind } from '@/shared/types/NoticeKind'
import type { StorageMode } from '@/shared/enums/StorageMode'

// Provided by Root.
export interface DataContextValue {
  mode: StorageMode
  importFiles: (files: Iterable<File>) => Promise<void>
  importSample: () => Promise<void>
  notify: (text: string, kind?: NoticeKind) => void
}
