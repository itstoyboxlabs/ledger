import type { TakeHome } from '@/shared/types/TakeHome'
export const TAKE_HOME_DEFAULTS: TakeHome = {
  salary: 80000,
  deductions: [
    { id: 'd401k', kind: '401k', unit: 'pct', amount: 4 },
    { id: 'dmed', kind: 'insurance', unit: 'mo', amount: 150 },
  ],
}
