import { planningAge } from './planningAge'

const today = '2026-11-08'

describe('planningAge', () => {
  it('is null with no birth date and no saved age', () => {
    expect(planningAge({ birthDate: null, savedAge: null, balancesAsOf: '2026-10-31', today })).toBeNull()
  })
  it('uses the age on the Balances date', () => {
    expect(planningAge({ birthDate: '1990-11-01', savedAge: null, balancesAsOf: '2025-10-31', today }))
      .toEqual({ age: 34, source: 'balances', on: '2025-10-31' })
  })
  it('moves forward when the Balances date does', () => {
    expect(planningAge({ birthDate: '1990-11-01', savedAge: null, balancesAsOf: '2026-11-05', today })?.age).toBe(36)
  })
  it('uses today when Balances has no date or a broken one', () => {
    for (const balancesAsOf of [null, '', 'soon']) {
      expect(planningAge({ birthDate: '1990-11-01', savedAge: null, balancesAsOf, today }))
        .toEqual({ age: 36, source: 'today', on: today })
    }
  })
  it('lets the birth date win over an old saved age', () => {
    expect(planningAge({ birthDate: '1990-11-01', savedAge: 50, balancesAsOf: null, today })?.age).toBe(36)
  })
  it('keeps an old saved age fixed when there is no birth date', () => {
    expect(planningAge({ birthDate: null, savedAge: 30, balancesAsOf: '2026-10-31', today }))
      .toEqual({ age: 30, source: 'saved', on: null })
  })
})
