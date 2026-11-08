import { applyData } from '@/shared/utils/applyData'
import { faviconUrl } from './faviconUrl'

describe('faviconUrl', () => {
  beforeEach(() => applyData({ merchants: { Netflix: 'netflix.com', Spotify: 'spotify.com' } }))
  afterEach(() => applyData({}))

  it('maps a known merchant to its icon path', () => {
    expect(faviconUrl('Netflix')).toBe('/icons/netflix.com.png')
    expect(faviconUrl('Spotify')).toBe('/icons/spotify.com.png')
  })
  it('returns null for an unknown merchant', () => {
    expect(faviconUrl('Hulu')).toBeNull()
  })
  it('is case sensitive and null for empty names', () => {
    expect(faviconUrl('netflix')).toBeNull()
    expect(faviconUrl('')).toBeNull()
  })
  it('returns null when there are no merchants', () => {
    applyData({})
    expect(faviconUrl('Netflix')).toBeNull()
  })
})
