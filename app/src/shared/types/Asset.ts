import type { AssetPool } from '@/shared/enums/AssetPool'

// What you own. `pool` defaults to savings.
export interface Asset {
  id: string
  name: string
  balance: number
  pool?: AssetPool
}
