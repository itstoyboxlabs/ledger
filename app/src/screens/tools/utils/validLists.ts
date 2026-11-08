import type { ToolList } from '@/screens/tools/types/ToolList'

/* ---------- simple lists (user-made tools) ---------- */

// Lists: [{ id, title, description, items: [{ id, name, amount }] }] in the `lists` key.
// First read migrates the old `sellItems` key into a list titled "Selling stuff" with
// id 'sell' (so a saved "show this tool" choice still matches). `sellItems` is left alone.
export const validLists = (v: unknown): v is ToolList[] =>
  Array.isArray(v) &&
  v.every((l: Partial<ToolList> | null) => l && typeof l.id === 'string' && typeof l.title === 'string' && Array.isArray(l.items))
