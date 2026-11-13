import { resolvePayPeriods } from './resolvePayPeriods'
import { budgetSavingsYearly } from '@/shared/utils/budgetSavingsYearly'
import type { PayContext } from '@/screens/retirement/types/PayContext'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'
import { takeHomeMonthly } from '@/shared/utils/takeHomeMonthly'

const today = { salary: 80000, deductions: [{ id: 'k', kind: '401k', unit: 'pct', amount: 4, match: 50 }] } as RawTakeHome
const noK = { salary: 60000, deductions: [{ id: 'i', kind: 'insurance', unit: 'mo', amount: 100 }] } as RawTakeHome
const rows = [{ id: 'r', name: 'Rent', amount: 2000 }] as BudgetRow[]
const cheap = [{ id: 'r', name: 'Rent', amount: 1000 }] as BudgetRow[]
const ctx: PayContext = {
  takeHome: today,
  takeHomePresets: [{ id: 'th1', name: 'Easier job', data: noK }],
  budget: { rows, leftover: [] },
  budgetPresets: [{ id: 'b1', name: 'Frugal', data: cheap }],
  taxState: 'tx',
  // the Budget follows the Take-home tool
  incomeOf: (th) => takeHomeMonthly(th, 'tx'),
}
const period = (o: Partial<PayPeriod> = {}): PayPeriod => ({
  id: 'p', label: '', fromAge: 30, toAge: 'retire', raisePct: 0,
  takeHomeFrom: 'today', takeHomePreset: '', k401: 3000, saveFrom: 'today', savePreset: '', savings: 7000, ...o,
})

describe('resolvePayPeriods', () => {
  it('today uses the Take-home tool and the Budget like the no-plan Auto values', () => {
    const [r] = resolvePayPeriods([period()], ctx)
    expect(r.sim).toMatchObject({ own: 3200, match: 1600, capOwn: true })
    expect(r.sim.saving).toBeCloseTo(budgetSavingsYearly({ leftover: [] }, rows, takeHomeMonthly(today, 'tx')), 6)
    expect(r).toMatchObject({ missingPay: false, missingSave: false })
  })

  it('a Take-home preset with no 401k line puts nothing into the 401k', () => {
    const [r] = resolvePayPeriods([period({ takeHomeFrom: 'preset', takeHomePreset: 'th1' })], ctx)
    expect(r.sim).toMatchObject({ own: 0, match: 0 })
  })

  it('a Budget preset saves its own leftover, with the period\'s Take-home income', () => {
    const [r] = resolvePayPeriods([period({ takeHomeFrom: 'preset', takeHomePreset: 'th1', saveFrom: 'preset', savePreset: 'b1' })], ctx)
    expect(r.sim.saving).toBeCloseTo((takeHomeMonthly(noK, 'tx') - 1000) * 12, 6)
  })

  it('a Budget preset in the new shape saves its own leftover split', () => {
    const data = { rows: cheap, leftover: [{ id: 'a', target: 'savings', pct: 25 }] }
    const [r] = resolvePayPeriods([period({ takeHomeFrom: 'preset', takeHomePreset: 'th1', saveFrom: 'preset', savePreset: 'b1' })], { ...ctx, budgetPresets: [{ id: 'b1', name: 'Frugal', data }] })
    expect(r.sim.saving).toBeCloseTo((takeHomeMonthly(noK, 'tx') - 1000) * 0.25 * 12, 6)
  })

  it('typed values are dollars a year', () => {
    const [r] = resolvePayPeriods([period({ takeHomeFrom: 'typed', saveFrom: 'typed' })], ctx)
    expect(r.sim).toMatchObject({ own: 3000, match: 0, capOwn: false, saving: 7000 })
  })

  it('a deleted preset falls back to the typed values and says so', () => {
    const [r] = resolvePayPeriods([period({ takeHomeFrom: 'preset', takeHomePreset: 'gone', saveFrom: 'preset', savePreset: 'gone' })], ctx)
    expect(r).toMatchObject({ missingPay: true, missingSave: true })
    expect(r.sim).toMatchObject({ own: 3000, match: 0, saving: 7000 })
  })

  it('saves nothing from the Budget before it loads', () => {
    expect(resolvePayPeriods([period()], { ...ctx, budget: null })[0].sim.saving).toBe(0)
  })
})
