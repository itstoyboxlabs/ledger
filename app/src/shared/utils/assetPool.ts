import type { Asset } from '@/shared/types/Asset'
import { AssetKind } from '@/shared/enums/AssetKind'
import { AssetPool } from '@/shared/enums/AssetPool'
import { assetKind } from '@/shared/utils/assetKind'

// Pre-tax and Roth accounts are locked until the 401k access age. Regular savings are not.
export const assetPool = (a: Pick<Asset, 'pool' | 'kind'>): AssetPool =>
  assetKind(a) === AssetKind.regular ? AssetPool.savings : AssetPool.k401
