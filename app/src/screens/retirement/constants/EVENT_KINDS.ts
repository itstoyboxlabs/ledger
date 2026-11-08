import type { RetireEventKind } from '@/screens/retirement/enums/RetireEventKind'
import type { SelectOption } from '@/screens/retirement/types/SelectOption'

export const EVENT_KINDS: SelectOption<RetireEventKind>[] = [
  { value: 'in', label: 'Money in' },
  { value: 'out', label: 'Money out' },
  { value: 'debt', label: 'Pay off a debt' },
]
