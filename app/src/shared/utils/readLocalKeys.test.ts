import { readLocalKeys } from './readLocalKeys'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('readLocalKeys', () => {
  it('is empty with nothing saved', () => {
    expect(readLocalKeys()).toEqual({})
  })
  it('returns only ledger: keys, parsed from JSON', () => {
    localStorage.setItem('ledger:a', JSON.stringify({ x: 1 }))
    localStorage.setItem('ledger:b', '[1,2]')
    localStorage.setItem('other', '"nope"')
    expect(readLocalKeys()).toEqual({ 'ledger:a': { x: 1 }, 'ledger:b': [1, 2] })
  })
  it('keeps a value that is not JSON as the raw string', () => {
    localStorage.setItem('ledger:raw', 'not json {')
    expect(readLocalKeys()).toEqual({ 'ledger:raw': 'not json {' })
  })
  it('returns what it has when storage throws', () => {
    vi.spyOn(Storage.prototype, 'key').mockImplementation(() => { throw new Error('blocked') })
    localStorage.setItem('ledger:a', '1')
    expect(readLocalKeys()).toEqual({})
  })
  it('includes the About you keys next to the tax state', () => {
    localStorage.setItem('ledger:taxState', '"ca"')
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    localStorage.setItem('ledger:age', JSON.stringify({ age: 40, asOf: 2026 }))
    localStorage.setItem('ledger:birthDate', '"1986-02-03"')
    expect(readLocalKeys()).toEqual({ 'ledger:taxState': 'ca', 'ledger:filingStatus': 'mfj', 'ledger:age': { age: 40, asOf: 2026 }, 'ledger:birthDate': '1986-02-03' })
  })
})
