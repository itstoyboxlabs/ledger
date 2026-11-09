import { ICON_BASE_URL } from '@/shared/constants/ICON_BASE_URL'
import { ICON_CATALOG_KEY } from '@/shared/constants/ICON_CATALOG_KEY'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { parseIconCatalog } from '@/shared/utils/parseIconCatalog'
import type { IconCatalog } from '@/shared/types/IconCatalog'

function readCache(): IconCatalog | null {
  try {
    const raw = sessionStorage.getItem(ICON_CATALOG_KEY)
    return raw ? parseIconCatalog(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function writeCache(catalog: IconCatalog) {
  try {
    sessionStorage.setItem(ICON_CATALOG_KEY, JSON.stringify(catalog))
  } catch { /* storage full or blocked: the in-memory copy is enough */ }
}

// Loads the shared logo catalog's index once per page: from this tab's sessionStorage if it is there, otherwise
// from the project's public Supabase storage bucket. The request carries nothing about the user's merchants. Any failure is silent
// and leaves the letter avatars in place.
export async function loadIconCatalog(): Promise<void> {
  const { status } = iconCatalogStore.getState()
  if (status !== 'idle' && status !== 'queued') return
  iconCatalogStore.setState({ status: 'loading' })
  try {
    let catalog = readCache()
    if (!catalog) {
      const res = await fetch(`${ICON_BASE_URL}/index.json`, { credentials: 'omit', referrerPolicy: 'no-referrer' })
      if (!res.ok) throw new Error(`catalog ${res.status}`)
      catalog = parseIconCatalog(await res.json())
      if (!catalog) throw new Error('catalog shape')
      writeCache(catalog)
    }
    iconCatalogStore.setState({ status: 'ready', domains: new Set(catalog.domains), names: catalog.names })
  } catch {
    iconCatalogStore.setState({ status: 'failed' })
  }
}
