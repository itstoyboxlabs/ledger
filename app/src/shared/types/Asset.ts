import type { AssetKind } from '@/shared/enums/AssetKind'
import type { AssetPool } from '@/shared/enums/AssetPool'

// What you own. `pool` defaults to savings. `kind` is how it is taxed; saves without it
// read through assetKind (a 401k pool asset is pre-tax, anything else regular).
export interface Asset {
  id: string
  name: string
  balance: number
  pool?: AssetPool
  kind?: AssetKind
}
