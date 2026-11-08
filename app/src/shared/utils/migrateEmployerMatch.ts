import { is401kKind } from '@/shared/utils/is401kKind'
import { legacyMatchPct } from '@/shared/utils/legacyMatchPct'
import { takeHomeDeductionsRaw } from '@/shared/utils/takeHomeDeductionsRaw'

export function migrateEmployerMatch() {
  try {
    const retire = JSON.parse(localStorage.getItem('ledger:retireCalc') || 'null')
    const pct = legacyMatchPct(retire)
    if (!(pct > 0)) return
    const th = JSON.parse(localStorage.getItem('ledger:takeHome') || 'null')
    if (!th || typeof th !== 'object') return
    const ds = takeHomeDeductionsRaw(th)
    if (ds.some((d) => d && 'match' in d) || !ds.some((d) => d && is401kKind(d.kind))) return
    localStorage.setItem(
      'ledger:takeHome',
      JSON.stringify({ salary: th.salary, deductions: ds.map((d) => (is401kKind(d.kind) ? { ...d, match: pct } : d)) }),
    )
  } catch { /* nothing saved yet, or storage unavailable */ }
}
