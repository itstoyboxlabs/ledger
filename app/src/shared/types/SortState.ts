import type { SortDirection } from '@/shared/enums/SortDirection'

export interface SortState {
  key: string
  dir: SortDirection
}
