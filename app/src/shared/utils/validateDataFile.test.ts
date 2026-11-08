import { validateDataFile } from './validateDataFile'

const txn = { id: 't1', date: '2026-01-01', amount: 5, kind: 'spend' }

describe('validateDataFile', () => {
  it('accepts a data file', () => {
    expect(() => validateDataFile({ version: 1, transactions: [txn] })).not.toThrow()
  })
  it('accepts a settings file', () => {
    expect(() => validateDataFile({ version: 1, settings: {} })).not.toThrow()
  })
  it('accepts all optional sections in the right shape', () => {
    expect(() => validateDataFile({
      version: 1, transactions: [], accounts: {}, merchants: {}, periods: {}, subscriptions: [], settings: {},
    })).not.toThrow()
  })
  it.each([null, undefined, 'x', 5, [], [txn]])('rejects a non-object: %j', (v) => {
    expect(() => validateDataFile(v)).toThrow('not a ledger file')
  })
  it('rejects a file with neither transactions nor settings', () => {
    expect(() => validateDataFile({ version: 1 })).toThrow('no transactions or settings')
  })
  it('rejects an unknown version', () => {
    expect(() => validateDataFile({ version: 2, settings: {} })).toThrow('unknown version')
    expect(() => validateDataFile({ settings: {} })).toThrow('unknown version')
  })
  it('rejects transactions that are not a list', () => {
    expect(() => validateDataFile({ version: 1, transactions: {} })).toThrow('transactions section')
  })
  it('names the first bad transaction', () => {
    expect(() => validateDataFile({ version: 1, transactions: [txn, { ...txn, amount: '5' }] })).toThrow('Transaction 2')
    expect(() => validateDataFile({ version: 1, transactions: [null] })).toThrow('Transaction 1')
    expect(() => validateDataFile({ version: 1, transactions: [{ ...txn, id: 1 }] })).toThrow('Transaction 1')
    expect(() => validateDataFile({ version: 1, transactions: [{ ...txn, kind: undefined }] })).toThrow('Transaction 1')
  })
  it('rejects a date that is not YYYY-MM-DD and names the row', () => {
    expect(() => validateDataFile({ version: 1, transactions: [txn, { ...txn, id: 't2', date: '10/04/2026' }] }))
      .toThrow('Transaction 2 (t2) has the date "10/04/2026". Dates must be YYYY-MM-DD.')
    expect(() => validateDataFile({ version: 1, transactions: [{ ...txn, date: '2026-1-04' }] })).toThrow('Transaction 1 (t1)')
    expect(() => validateDataFile({ version: 1, transactions: [{ ...txn, date: '2026-13-04' }] })).toThrow('YYYY-MM-DD')
  })
  it('rejects an account that is not in the accounts section and names the row', () => {
    const accounts = { chk: { name: 'Checking' } }
    expect(() => validateDataFile({ version: 1, accounts, transactions: [{ ...txn, account: 'chk' }] })).not.toThrow()
    expect(() => validateDataFile({ version: 1, accounts, transactions: [{ ...txn, account: 'chk' }, { ...txn, id: 't2', account: 'cc' }] }))
      .toThrow('Transaction 2 (t2) uses the account "cc", which is not in the accounts section.')
    expect(() => validateDataFile({ version: 1, accounts, transactions: [txn] })).toThrow('Transaction 1 (t1) uses the account ""')
  })
  it('skips the account check when the file has no accounts section', () => {
    expect(() => validateDataFile({ version: 1, transactions: [{ ...txn, account: 'cc' }] })).not.toThrow()
  })
  it.each([
    ['accounts', []], ['merchants', []], ['periods', 'x'], ['subscriptions', {}], ['settings', []],
  ])('rejects a bad %s section', (key, value) => {
    expect(() => validateDataFile({ version: 1, transactions: [], settings: {}, [key]: value })).toThrow(`The ${key} section looks wrong.`)
  })
})
