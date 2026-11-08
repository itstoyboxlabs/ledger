import type { RetireRepeat } from '@/screens/retirement/enums/RetireRepeat'
import type { SelectOption } from '@/screens/retirement/types/SelectOption'

export const REPEAT_OPTIONS: SelectOption<RetireRepeat>[] = [
  { value: 'once', label: 'Once' },
  { value: 'month', label: 'Every month' },
  { value: 'year', label: 'Every year' },
  { value: '2year', label: 'Every two years' },
]
