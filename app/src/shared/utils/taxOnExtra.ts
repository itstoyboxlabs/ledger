import { taxOn } from '@/shared/utils/taxOn'
import type { ExtraTaxResult } from '@/shared/types/ExtraTaxResult'

// marginal tax on `extra` income stacked on top of `base` income (for windfalls like stock)
export function taxOnExtra(base: number, extra: number, stateKey: string): ExtraTaxResult {
  const t = taxOn(base + extra, stateKey).total - taxOn(base, stateKey).total
  return { total: t, effective: extra > 0 ? t / extra : 0 }
}
