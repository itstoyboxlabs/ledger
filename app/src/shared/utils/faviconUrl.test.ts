import { applyData } from '@/shared/utils/applyData'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { ICON_BASE_URL } from '@/shared/constants/ICON_BASE_URL'
import { faviconUrl } from './faviconUrl'

beforeEach(() => applyData({ merchants: { Netflix: 'netflix.com', Spotify: 'spotify.com', Hulu: 'www.Hulu.com' } }))
afterEach(() => {
  applyData({})
  storageModeStore.setState({ mode: 'browser' })
})

describe('faviconUrl in local mode', () => {
  beforeEach(() => storageModeStore.setState({ mode: 'local' }))

  it('maps a known merchant to its downloaded icon', () => {
    expect(faviconUrl('Netflix')).toBe('/icons/netflix.com.png')
    expect(faviconUrl('Spotify')).toBe('/icons/spotify.com.png')
  })
  it('cleans up the domain', () => {
    expect(faviconUrl('Hulu')).toBe('/icons/hulu.com.png')
  })
  it('is null for a merchant without a domain, even with a catalog loaded', () => {
    iconCatalogStore.setState({ status: 'ready', domains: new Set(['uber.com']), names: { uber: 'uber.com' } })
    expect(faviconUrl('Uber')).toBeNull()
    expect(faviconUrl('netflix')).toBeNull()
    expect(faviconUrl('')).toBeNull()
  })
})

describe('faviconUrl in browser mode', () => {
  it('is null for every merchant until the catalog loads', () => {
    expect(faviconUrl('Netflix')).toBeNull()
    expect(faviconUrl('Uber')).toBeNull()
  })
  it('uses the catalog for a domain it has and for a name it knows', () => {
    iconCatalogStore.setState({ status: 'ready', domains: new Set(['netflix.com', 'uber.com']), names: { uber: 'uber.com' } })
    expect(faviconUrl('Netflix')).toBe(`${ICON_BASE_URL}/netflix.com.png`)
    expect(faviconUrl('Uber')).toBe(`${ICON_BASE_URL}/uber.com.png`)
  })
  it('is null for a merchant the catalog does not have', () => {
    iconCatalogStore.setState({ status: 'ready', domains: new Set(['netflix.com']), names: {} })
    expect(faviconUrl('Spotify')).toBeNull()
    expect(faviconUrl('Lucali')).toBeNull()
  })
  it('is null when the catalog failed to load', () => {
    iconCatalogStore.setState({ status: 'failed', domains: new Set(), names: {} })
    expect(faviconUrl('Netflix')).toBeNull()
  })
})
