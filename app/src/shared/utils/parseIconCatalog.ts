import type { IconCatalog } from '@/shared/types/IconCatalog'

// Checks the shape of a downloaded or cached catalog index. Anything unexpected gives null, never a throw.
export function parseIconCatalog(raw: unknown): IconCatalog | null {
  if (!raw || typeof raw !== 'object') return null
  const { domains, names } = raw as Record<string, unknown>
  if (!Array.isArray(domains) || !domains.every((d) => typeof d === 'string')) return null
  if (!names || typeof names !== 'object' || Array.isArray(names)) return null
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(names)) if (typeof v === 'string') clean[k] = v
  return { domains, names: clean }
}
