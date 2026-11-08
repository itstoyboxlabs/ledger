import { applyData } from '@/shared/utils/applyData'
import { acctName } from './acctName'

describe('acctName', () => {
  beforeEach(() => applyData({ accounts: { chk: { name: 'Checking 1234', type: 'checking' } }, transactions: [] }))
  it('returns the account name', () => expect(acctName('chk')).toBe('Checking 1234'))
  it('falls back to the id for unknown accounts', () => expect(acctName('zzz')).toBe('zzz'))
})
