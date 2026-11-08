import { FilingStatus } from '@/shared/enums/FilingStatus'
import { taxOn } from '@/shared/utils/taxOn'
import type { ExtraTaxResult } from '@/shared/types/ExtraTaxResult'

// marginal tax on `extra` income stacked on top of `base` income (for windfalls like stock)
export function taxOnExtra(base: number, extra: number, stateKey: string, filing: FilingStatus = FilingStatus.single): ExtraTaxResult {
  const t = taxOn(base + extra, stateKey, filing).total - taxOn(base, stateKey, filing).total
  return { total: t, effective: extra > 0 ? t / extra : 0 }
}
