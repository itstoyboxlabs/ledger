import type { SortState } from '@/shared/types/SortState'
import { SortDirection } from '@/shared/enums/SortDirection'
// first click on a text column goes A to Z, on a number column biggest first
export const nextSort = (sort: SortState, key: string): SortState =>
  sort.key === key
    ? { key, dir: sort.dir === SortDirection.asc ? SortDirection.desc : SortDirection.asc }
    : { key, dir: key === 'name' ? SortDirection.asc : SortDirection.desc }
