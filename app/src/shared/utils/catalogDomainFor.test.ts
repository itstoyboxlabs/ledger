import { catalogDomainFor } from './catalogDomainFor'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'

beforeEach(() =>
  iconCatalogStore.setState({
    status: 'ready',
    domains: new Set(['uber.com', 'ubereats.com', 'netflix.com', 'mta.info']),
    names: { uber: 'uber.com', 'uber eats': 'ubereats.com', mta: 'mta.info', 'gone brand': 'gone.com' },
  }),
)

describe('catalogDomainFor', () => {
  it('uses the merchants map domain when the catalog has it', () => {
    expect(catalogDomainFor('My Streaming', 'netflix.com')).toBe('netflix.com')
  })
  it('falls back to the name when the domain is not in the catalog', () => {
    expect(catalogDomainFor('Uber', 'uber.co.uk')).toBe('uber.com')
  })
  it('matches a name with no domain at all', () => {
    expect(catalogDomainFor('Uber')).toBe('uber.com')
    expect(catalogDomainFor('UBER *TRIP 8005')).toBe('uber.com')
  })
  it('tries the longest leading word group first', () => {
    expect(catalogDomainFor('Uber Eats Delivery')).toBe('ubereats.com')
    expect(catalogDomainFor('MTA NYCT PAYGO')).toBe('mta.info')
  })
  it('is null for an unknown merchant or a name pointing at a missing logo', () => {
    expect(catalogDomainFor('Lucali')).toBeNull()
    expect(catalogDomainFor('Gone Brand')).toBeNull()
    expect(catalogDomainFor('')).toBeNull()
  })
  it('is null before the catalog has loaded', () => {
    iconCatalogStore.setState({ status: 'idle', domains: new Set(), names: {} })
    expect(catalogDomainFor('Uber', 'uber.com')).toBeNull()
  })
})
