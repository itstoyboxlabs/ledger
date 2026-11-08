import { usePersistedState } from '@/shared/hooks/usePersistedState'
import type { Asset } from '@/shared/types/Asset'

// Assets: [{ id, name, balance, pool? }] plus an "as of" date in `assetsAsOf`. `pool` is
// 'savings' (use anytime, the default) or '401k' (locked until the access age).
export function useAssets() {
  return usePersistedState<Asset[]>(
    'assets', [],
    (v) => Array.isArray(v) && v.every((a: Partial<Asset> | null) => !!a && typeof a.id === 'string' && typeof a.balance === 'number'),
  )
}
