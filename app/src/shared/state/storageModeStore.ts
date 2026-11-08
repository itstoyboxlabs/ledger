import { create } from 'zustand'
import type { StorageModeState } from '@/shared/types/StorageModeState'
import { StorageMode } from '@/shared/enums/StorageMode'

// How the app stores its settings. 'local': the Vite dev server answers /api/* and the files live in the data
// folder. 'browser': no server, everything lives in IndexedDB in this browser. detectMode() sets it at startup.
export const storageModeStore = create<StorageModeState>()(() => ({ mode: StorageMode.browser }))
