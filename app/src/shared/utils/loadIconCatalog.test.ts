import { loadIconCatalog } from './loadIconCatalog'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { ICON_BASE_URL } from '@/shared/constants/ICON_BASE_URL'
import { ICON_CATALOG_KEY } from '@/shared/constants/ICON_CATALOG_KEY'

const INDEX = { domains: ['netflix.com', 'uber.com'], names: { uber: 'uber.com' } }
const ok = (body: unknown) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, json: async () => body }))

beforeEach(() => {
  iconCatalogStore.setState({ status: 'idle', domains: new Set(), names: {} })
  sessionStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())

describe('loadIconCatalog', () => {
  it('downloads the index once and fills the store', async () => {
    const fetchMock = ok(INDEX)
    vi.stubGlobal('fetch', fetchMock)
    await loadIconCatalog()
    await loadIconCatalog()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(`${ICON_BASE_URL}/index.json`)
    const s = iconCatalogStore.getState()
    expect(s.status).toBe('ready')
    expect(s.domains.has('uber.com')).toBe(true)
    expect(s.names.uber).toBe('uber.com')
  })
  it('caches the index in sessionStorage and reads it back without a request', async () => {
    vi.stubGlobal('fetch', ok(INDEX))
    await loadIconCatalog()
    expect(JSON.parse(sessionStorage.getItem(ICON_CATALOG_KEY)!)).toEqual(INDEX)

    iconCatalogStore.setState({ status: 'idle', domains: new Set(), names: {} })
    const second = ok({})
    vi.stubGlobal('fetch', second)
    await loadIconCatalog()
    expect(second).not.toHaveBeenCalled()
    expect(iconCatalogStore.getState().domains.has('netflix.com')).toBe(true)
  })
  it('fails silently on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    await expect(loadIconCatalog()).resolves.toBeUndefined()
    expect(iconCatalogStore.getState().status).toBe('failed')
    expect(iconCatalogStore.getState().domains.size).toBe(0)
  })
  it('fails silently on a bad status or a bad shape', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => INDEX })))
    await loadIconCatalog()
    expect(iconCatalogStore.getState().status).toBe('failed')

    iconCatalogStore.setState({ status: 'idle' })
    vi.stubGlobal('fetch', ok({ nope: true }))
    await loadIconCatalog()
    expect(iconCatalogStore.getState().status).toBe('failed')
    expect(sessionStorage.getItem(ICON_CATALOG_KEY)).toBeNull()
  })
  it('ignores a broken cache entry and downloads instead', async () => {
    sessionStorage.setItem(ICON_CATALOG_KEY, '{not json')
    const fetchMock = ok(INDEX)
    vi.stubGlobal('fetch', fetchMock)
    await loadIconCatalog()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(iconCatalogStore.getState().status).toBe('ready')
  })
})
