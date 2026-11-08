import { assetKind } from './assetKind'
import type { AssetKind } from '@/shared/enums/AssetKind'

describe('assetKind', () => {
  it('keeps a saved kind', () => {
    expect(assetKind({ kind: 'roth' })).toBe('roth')
    expect(assetKind({ kind: 'pretax', pool: 'savings' })).toBe('pretax')
    expect(assetKind({ kind: 'regular', pool: '401k' })).toBe('regular')
  })
  it('reads old 401k assets as pre-tax', () => expect(assetKind({ pool: '401k' })).toBe('pretax'))
  it('reads everything else as regular savings', () => {
    expect(assetKind({})).toBe('regular')
    expect(assetKind({ pool: 'savings' })).toBe('regular')
    expect(assetKind({ kind: 'hsa' as AssetKind })).toBe('regular')
  })
})
