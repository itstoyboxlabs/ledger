import { writePersisted } from '@/shared/utils/writePersisted'

beforeEach(() => localStorage.clear())

describe('writePersisted', () => {
  it('saves JSON under the ledger: prefix and returns it', () => {
    expect(writePersisted('k', { a: 1 })).toBe('{"a":1}')
    expect(localStorage.getItem('ledger:k')).toBe('{"a":1}')
  })

  it('returns null instead of throwing when storage fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    expect(writePersisted('k', 1)).toBeNull()
    spy.mockRestore()
  })
})
