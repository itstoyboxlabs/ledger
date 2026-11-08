import { useEffect } from 'react'
import { useStore } from 'zustand'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { requestIconCatalog } from '@/shared/utils/requestIconCatalog'
import { isLocal } from '@/shared/utils/isLocal'

// Asks for the shared logo catalog (browser mode only) and re-renders the caller when it arrives.
// Returns the catalog's status.
export function useIconCatalog() {
  useEffect(() => {
    if (!isLocal()) requestIconCatalog()
  }, [])
  return useStore(iconCatalogStore, (s) => s.status)
}
