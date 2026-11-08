import { idbSet } from './idbSet'
import { idbGet } from './idbGet'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage())

describe('idbSet', () => {
  it('stores a value that idbGet reads back', async () => {
    await idbSet('k', { n: 1 })
    expect(await idbGet('k')).toEqual({ n: 1 })
  })
  it('overwrites an existing key', async () => {
    await idbSet('k', 'first')
    await idbSet('k', 'second')
    expect(await idbGet('k')).toBe('second')
  })
  it('stores a copy, so later changes to the original do not leak in', async () => {
    const v = { list: [1] }
    await idbSet('k', v)
    v.list.push(2)
    expect(await idbGet('k')).toEqual({ list: [1] })
  })
  it('rejects a value IndexedDB cannot clone', async () => {
    await expect(idbSet('k', () => {})).rejects.toBeTruthy()
  })
})
