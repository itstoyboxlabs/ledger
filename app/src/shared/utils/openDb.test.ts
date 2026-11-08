import { openDb } from './openDb'

describe('openDb', () => {
  it('opens the ledger database with its kv store', async () => {
    const db = await openDb()
    expect(db.name).toBe('ledger')
    expect(db.objectStoreNames.contains('kv')).toBe(true)
  })
  it('returns the same connection on every call', async () => {
    expect(await openDb()).toBe(await openDb())
  })
})
