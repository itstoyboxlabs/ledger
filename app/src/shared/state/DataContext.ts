import { createContext } from 'react'
import type { DataContextValue } from '@/shared/types/DataContextValue'

// Provided by Root: { mode, importFiles(files), importSample(), notify(text, kind) }
export const DataContext = createContext<DataContextValue | null>(null)
