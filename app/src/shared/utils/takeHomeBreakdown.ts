import { taxOn } from '@/shared/utils/taxOn'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import { deductionTax } from '@/shared/utils/deductionTax'
import { deductionYearly } from '@/shared/utils/deductionYearly'
import { cap401kLines } from '@/shared/utils/cap401kLines'
import { normalizeTakeHome } from '@/shared/utils/normalizeTakeHome'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import type { TakeHomeBreakdown } from '@/shared/types/TakeHomeBreakdown'
import type { DeductionLine } from '@/shared/types/DeductionLine'

export function takeHomeBreakdown(thRaw: RawTakeHome, taxState: string, filing: FilingStatus = FilingStatus.single): TakeHomeBreakdown {
  const th = normalizeTakeHome(thRaw)
  const salary = Number(th.salary) || 0
  const lines = cap401kLines(th.deductions.map((d) => ({ ...d, yearly: deductionYearly(d, salary) })))
  const sum = (pred: (l: DeductionLine) => boolean): number => lines.filter(pred).reduce((s, l) => s + l.yearly, 0)
  const preIncome = sum((l) => deductionTax(l.kind) !== 'none')
  const preFica = sum((l) => deductionTax(l.kind) === 'all')
  const post = sum((l) => deductionTax(l.kind) === 'none')
  const base = taxOn(Math.max(0, salary - preIncome), taxState, filing)
  const fica = taxOn(Math.max(0, salary - preFica), taxState, filing).fica
  const taxes = base.fed + base.state + base.local + fica
  return {
    salary, lines, fed: base.fed, state: base.state, local: base.local, fica, taxes,
    net: salary - preIncome - post - taxes,
  }
}
