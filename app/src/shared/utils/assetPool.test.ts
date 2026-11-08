import { assetPool } from './assetPool'
import type { AssetPool } from '@/shared/enums/AssetPool'

describe('assetPool', () => {
  it('maps 401k to the 401k pool', () => expect(assetPool({ pool: '401k' })).toBe('401k'))
  it('maps everything else to savings', () => {
    expect(assetPool({ pool: 'cash' as AssetPool })).toBe('savings')
    expect(assetPool({})).toBe('savings')
  })
})
