import { assetPool } from './assetPool'
import type { AssetPool } from '@/shared/enums/AssetPool'

describe('assetPool', () => {
  it('maps 401k to the 401k pool', () => expect(assetPool({ pool: '401k' })).toBe('401k'))
  it('maps everything else to savings', () => {
    expect(assetPool({ pool: 'cash' as AssetPool })).toBe('savings')
    expect(assetPool({})).toBe('savings')
  })
  it('locks pre-tax and Roth accounts and frees regular ones', () => {
    expect(assetPool({ kind: 'pretax' })).toBe('401k')
    expect(assetPool({ kind: 'roth' })).toBe('401k')
    expect(assetPool({ kind: 'regular', pool: '401k' })).toBe('savings')
  })
})
