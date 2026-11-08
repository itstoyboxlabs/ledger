import type { StockType } from '@/shared/enums/StockType'

export const STOCK_TYPES: { value: StockType; label: string }[] = [
  { value: 'rsu', label: 'RSUs' },
  { value: 'nso', label: 'Options (NSO)' },
  { value: 'iso', label: 'Options (ISO)' },
]
