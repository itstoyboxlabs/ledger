import { STATES } from '@/shared/constants/STATES'
import { stateDeduction } from './stateDeduction'

describe('stateDeduction', () => {
  it('is the state deduction for a single filer', () => {
    expect(stateDeduction(STATES.ca)).toBe(STATES.ca.deduction)
    expect(stateDeduction(STATES.az, 'single')).toBe(16100)
  })
  it('uses the joint federal deduction where the state follows the federal one', () => {
    expect(stateDeduction(STATES.az, 'mfj')).toBe(32200)
    expect(stateDeduction(STATES.co, 'mfj')).toBe(32200)
  })
  it('keeps the single deduction for every other state', () => {
    expect(stateDeduction(STATES.ca, 'mfj')).toBe(STATES.ca.deduction)
    expect(stateDeduction(STATES.tx, 'mfj')).toBe(0)
  })
})
