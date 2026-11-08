import { idbDelete } from './idbDelete'
import { idbGet } from './idbGet'
import { idbSet } from './idbSet'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage())

describe('idbDelete', () => {
  it('removes a stored key', async () => {
    await idbSet('k', { n: 1 })
    await idbDelete('k')
    expect(await idbGet('k')).toBeUndefined()
  })
  it('leaves other keys alone', async () => {
    await idbSet('a', 1)
    await idbSet('b', 2)
    await idbDelete('a')
    expect(await idbGet('b')).toBe(2)
  })
  it('does nothing for a key that is not there', async () => {
    await expect(idbDelete('missing')).resolves.toBeUndefined()
  })
})
