import type { ReactNode } from 'react'

// One choice in the shared Dropdown. `badge` sits before the label; `trailing` draws a control at the right end.
export interface DropdownOption {
  value: string
  label: string
  badge?: ReactNode
  trailing?: () => ReactNode
}
