import { readPersisted } from '@/shared/utils/readPersisted'

beforeEach(() => localStorage.clear())

describe('readPersisted', () => {
  it('returns the fallback and a null raw when nothing is saved', () => {
    expect(readPersisted('k', 5)).toEqual({ raw: null, value: 5 })
  })

  it('parses a saved value', () => {
    localStorage.setItem('ledger:k', '{"a":1}')
    expect(readPersisted('k', null)).toEqual({ raw: '{"a":1}', value: { a: 1 } })
  })

  it('falls back on corrupted JSON', () => {
    localStorage.setItem('ledger:k', '{nope')
    expect(readPersisted('k', 'fb').value).toBe('fb')
  })

  it('falls back when validate rejects the saved value', () => {
    localStorage.setItem('ledger:k', '"text"')
    expect(readPersisted('k', 0, (v) => typeof v === 'number').value).toBe(0)
  })
})
