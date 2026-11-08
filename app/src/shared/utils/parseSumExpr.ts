import type { SumExpr } from '@/shared/types/SumExpr'
import type { SumTerm } from '@/shared/types/SumTerm'
// Parses a running-total expression like "3200 checking + 4315 paycheck - 50 fee"
// into its individual terms plus the sum. Each term is a number with an optional
// free-text label — anything else in the chunk. Josh builds cash-on-hand by adding
// up several sources and wants to SEE the parts, so he can tell at a glance whether
// he remembered the $400 he expects from selling a monitor; a single collapsed
// number can't answer that.
export function parseSumExpr(expr: string | null | undefined): SumExpr {
  if (!expr || !expr.trim()) return { terms: [], total: 0 }
  const terms: SumTerm[] = []
  for (const raw of expr.split(/(?=[+-])/)) {
    const chunk = raw.trim()
    if (!chunk) continue
    const sign = chunk.startsWith('-') ? -1 : 1
    const body = chunk.replace(/^[+-]/, '').trim()
    const m = body.match(/[\d,]*\.?\d+/)
    if (!m) continue
    const value = sign * parseFloat(m[0].replace(/,/g, ''))
    if (!Number.isFinite(value)) continue
    terms.push({ value, label: body.replace(m[0], '').replace(/[$,]/g, '').trim() })
  }
  return { terms, total: terms.reduce((sum, t) => sum + t.value, 0) }
}
