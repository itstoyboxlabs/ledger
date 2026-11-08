import type { Asset } from '@/shared/types/Asset'
import { AssetPool } from '@/shared/enums/AssetPool'
export const assetPool = (a: Pick<Asset, 'pool'>): AssetPool => (a.pool === AssetPool.k401 ? AssetPool.k401 : AssetPool.savings)
