import { normalizeAccounts } from './normalizeAccounts'
import type { RawAccounts } from '@/shared/types/RawAccounts'

describe('normalizeAccounts', () => {
  it('returns an empty object for nullish input', () => {
    expect(normalizeAccounts(undefined)).toEqual({})
    expect(normalizeAccounts(null as unknown as undefined)).toEqual({})
    expect(normalizeAccounts({})).toEqual({})
  })
  it('upgrades legacy string labels', () => {
    expect(normalizeAccounts({ chk: 'Checking •1234' })).toEqual({
      chk: { name: 'Checking •1234', bank: '', type: 'checking', last4: '1234' },
    })
  })
  it('treats the cc id or a Card label as a card', () => {
    const out = normalizeAccounts({ cc: 'Visa 1234', x: 'Store card 9999' })
    expect(out.cc.type).toBe('card')
    expect(out.x.type).toBe('card')
    expect(out.cc.last4).toBe('1234')
  })
  it('leaves last4 empty when the label has no trailing digits', () => {
    expect(normalizeAccounts({ chk: 'Checking' }).chk.last4).toBe('')
  })
  it('fills defaults for object accounts and keeps valid types', () => {
    const out = normalizeAccounts({ sav: { type: 'savings' }, a: { name: 'A', bank: 'B', type: 'card', last4: '1111' } })
    expect(out.sav).toEqual({ name: 'sav', bank: '', type: 'savings', last4: '' })
    expect(out.a).toEqual({ name: 'A', bank: 'B', type: 'card', last4: '1111' })
  })
  it('falls back to checking for unknown types and skips junk entries', () => {
    const out = normalizeAccounts({ a: { type: 'brokerage' }, b: null, c: 5 } as unknown as RawAccounts)
    expect(out.a.type).toBe('checking')
    expect(Object.keys(out)).toEqual(['a'])
  })
})
