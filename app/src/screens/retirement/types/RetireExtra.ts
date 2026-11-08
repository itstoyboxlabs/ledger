import type { AssetPool } from '@/shared/enums/AssetPool'

// An extra saving line the user adds, like an IRA. `to` is the pool it goes into.
export interface RetireExtra {
  id: string
  name: string
  amount: number
  unit: 'yr' | 'mo'
  to: AssetPool
}
