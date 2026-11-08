import { applyData } from '@/shared/utils/applyData'
import { missingAccounts } from './missingAccounts'

describe('missingAccounts', () => {
  beforeEach(() =>
    applyData({
      accounts: { chk: { name: 'Checking' }, cc: { name: 'Card', type: 'card' } },
      periods: {
        a: { account: 'chk', start: '2026-10-01', end: '2026-10-31' },
        b: { account: 'cc', start: '2026-10-15', end: '2026-11-14' },
      },
    }),
  )
  afterEach(() => applyData({}))

  it('lists accounts that do not fully cover the month', () => {
    expect(missingAccounts('2026-10')).toEqual(['cc'])
  })
  it('is empty when all are covered', () => {
    applyData({
      accounts: { chk: { name: 'Checking' } },
      periods: { a: { account: 'chk', start: '2026-10-01', end: '2026-10-31' } },
    })
    expect(missingAccounts('2026-10')).toEqual([])
  })
  it('lists everyone for a month with no statements', () => {
    expect(missingAccounts('2025-01').sort()).toEqual(['cc', 'chk'])
  })
  it('is empty with no accounts', () => {
    applyData({})
    expect(missingAccounts('2026-10')).toEqual([])
  })
})
