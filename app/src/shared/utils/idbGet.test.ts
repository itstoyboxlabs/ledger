import { idbGet } from './idbGet'
import { idbSet } from './idbSet'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage())

describe('idbGet', () => {
  it('returns undefined for a key that was never written', async () => {
    expect(await idbGet('nope')).toBeUndefined()
  })
  it('returns the stored value', async () => {
    await idbSet('k', { a: [1, 2] })
    expect(await idbGet('k')).toEqual({ a: [1, 2] })
  })
  it('keys are independent', async () => {
    await idbSet('one', 1)
    await idbSet('two', 2)
    expect(await idbGet('one')).toBe(1)
    expect(await idbGet('two')).toBe(2)
  })
})
