import type { IconCatalogStatus } from '@/shared/enums/IconCatalogStatus'

export interface IconCatalogState {
  status: IconCatalogStatus
  domains: ReadonlySet<string>
  names: Readonly<Record<string, string>>
}
