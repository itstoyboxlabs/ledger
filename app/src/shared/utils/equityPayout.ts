import { taxOnExtra } from '@/shared/utils/taxOnExtra'
import { ltcgOnExtra } from '@/shared/utils/ltcgOnExtra'
import { incomeTaxOnExtra } from '@/shared/utils/incomeTaxOnExtra'
import type { StockInputs } from '@/shared/types/StockInputs'
import type { EquityPayout } from '@/shared/types/EquityPayout'

// One place for the math, used by the tool and by Retirement's "options payout" source.
export function equityPayout(c: StockInputs, taxState: string): EquityPayout {
  const delta = Math.max(0, c.type === 'rsu' ? c.exit : c.exit - c.strike)
  const gross = delta * c.shares
  const years = Math.max(1, c.years)
  const slice = gross / years
  const longTerm = c.type === 'iso' && c.heldOver
  // ISO shares sold too soon are ordinary income but not wages, so no FICA (IRC 3121(a)(22)).
  // NSO and RSU income is wages and pays FICA.
  const tax = longTerm
    ? ltcgOnExtra(c.salary, slice, taxState)
    : c.type === 'iso'
      ? incomeTaxOnExtra(c.salary, slice, taxState)
      : taxOnExtra(c.salary, slice, taxState)
  const net = (slice - tax.total) * years
  return { delta, gross, years, slice, tax, net, longTerm }
}
