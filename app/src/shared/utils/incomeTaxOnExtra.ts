import { FilingStatus } from '@/shared/enums/FilingStatus'
import { taxOn } from '@/shared/utils/taxOn'
import type { ExtraTaxResult } from '@/shared/types/ExtraTaxResult'

// like taxOnExtra, but income tax only (federal, state and city), no Social Security or Medicare.
// For ordinary income that is not wages, such as ISO shares sold too soon (IRC 3121(a)(22)).
export function incomeTaxOnExtra(base: number, extra: number, stateKey: string, filing: FilingStatus = FilingStatus.single): ExtraTaxResult {
  const a = taxOn(base + extra, stateKey, filing)
  const b = taxOn(base, stateKey, filing)
  const t = a.fed + a.state + a.local - (b.fed + b.state + b.local)
  return { total: t, effective: extra > 0 ? t / extra : 0 }
}
