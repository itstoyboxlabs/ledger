import { useState } from 'react'
import { legacySellList } from '@/screens/tools/utils/legacySellList'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { validLists } from '@/screens/tools/utils/validLists'

export function useLists() {
  const [start] = useState(legacySellList)
  return usePersistedState('lists', start, validLists)
}
