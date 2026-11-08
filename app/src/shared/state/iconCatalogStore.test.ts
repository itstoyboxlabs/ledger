import { iconCatalogStore } from '@/shared/state/iconCatalogStore'

describe('iconCatalogStore', () => {
  it('holds the catalog domains and names', () => {
    iconCatalogStore.setState({ status: 'ready', domains: new Set(['uber.com']), names: { uber: 'uber.com' } })
    const s = iconCatalogStore.getState()
    expect(s.status).toBe('ready')
    expect(s.domains.has('uber.com')).toBe(true)
    expect(s.names.uber).toBe('uber.com')
  })
})
