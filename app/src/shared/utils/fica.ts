import { SS_WAGE_BASE } from '@/shared/constants/SS_WAGE_BASE'
import { ADDL_MEDICARE_OVER } from '@/shared/constants/ADDL_MEDICARE_OVER'
import { FilingStatus } from '@/shared/enums/FilingStatus'

// employee Social Security and Medicare on wages, plus the 0.9% Additional Medicare Tax
// over the filing status threshold (200k single, 250k married filing jointly)
export function fica(gross: number, filing: FilingStatus = FilingStatus.single): number {
  const over = ADDL_MEDICARE_OVER[filing] ?? ADDL_MEDICARE_OVER.single
  const ss = 0.062 * Math.min(gross, SS_WAGE_BASE)
  const medicare = 0.0145 * gross + (gross > over ? 0.009 * (gross - over) : 0)
  return ss + medicare
}
