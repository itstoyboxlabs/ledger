import { useMemo } from 'react'
import type { ToolCatalogEntry } from '@/screens/tools/types/ToolCatalogEntry'
import { LIST_FALLBACK_DESC } from '@/screens/tools/constants/LIST_FALLBACK_DESC'
import { TOOL_LIST } from '@/screens/tools/constants/TOOL_LIST'
import { useLists } from '@/screens/tools/hooks/useLists'

// built-in tools plus the user's lists, in picker order
export function useToolCatalog(): ToolCatalogEntry[] {
  const [lists] = useLists()
  return useMemo(
    (): ToolCatalogEntry[] => [
      ...TOOL_LIST,
      ...lists.map((l): ToolCatalogEntry => [l.id, l.title || 'Untitled list', l.description || LIST_FALLBACK_DESC]),
    ],
    [lists],
  )
}
