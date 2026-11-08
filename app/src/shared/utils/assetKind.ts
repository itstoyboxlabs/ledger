import type { Asset } from '@/shared/types/Asset'
import { AssetKind } from '@/shared/enums/AssetKind'
import { AssetPool } from '@/shared/enums/AssetPool'

// The tax type of an asset. Saves from before `kind` existed read as pre-tax when they sit
// in the retirement pool and as regular savings otherwise, so nothing moves.
export function assetKind(a: Pick<Asset, 'pool' | 'kind'>): AssetKind {
  if (a.kind === AssetKind.pretax || a.kind === AssetKind.roth || a.kind === AssetKind.regular) return a.kind
  return a.pool === AssetPool.k401 ? AssetKind.pretax : AssetKind.regular
}
