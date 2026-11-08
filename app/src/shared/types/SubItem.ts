import type { SubItemMode } from '@/shared/enums/SubItemMode'

// One line inside a breakdown budget row. In `month` mode `amount` is a flat monthly amount; in `week` mode the
// month is `amount` x `perWeek` x 4.
export interface SubItem {
  id: string
  name: string
  mode: SubItemMode
  amount: number
  perWeek: number
}
