import { create } from 'zustand'
import type { IconCatalogState } from '@/shared/types/IconCatalogState'

// The shared merchant logo catalog (browser mode only). Empty until loadIconCatalog() fills it, some time after
// the first paint. MerchantIcon subscribes through useIconCatalog(), so icons appear once it arrives.
export const iconCatalogStore = create<IconCatalogState>()(() => ({
  status: 'idle',
  domains: new Set<string>(),
  names: {},
}))
