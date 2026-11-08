import { useEffect, useMemo } from 'react'
import { isDebtList } from '@/shared/utils/isDebtList'
import { isLegacyDebts } from '@/shared/utils/isLegacyDebts'
import { normalizeDebts } from '@/shared/utils/normalizeDebts'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import type { Debt } from '@/shared/types/Debt'
import type { LegacyDebts } from '@/shared/types/LegacyDebts'

export function useDebts(): [Debt[], (next: Debt[]) => void] {
  const [raw, setRaw] = usePersistedState<Debt[] | LegacyDebts>('debts', [], (v) => isDebtList(v) || isLegacyDebts(v))
  const debts = useMemo(() => normalizeDebts(raw), [raw])
  // rewrite an old object save as the list, once
  useEffect(() => {
    if (!Array.isArray(raw)) setRaw(debts)
  }, [raw]) // eslint-disable-line react-hooks/exhaustive-deps
  return [debts, setRaw]
}
