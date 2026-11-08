import { normalizeMerchantName } from './normalizeMerchantName'

describe('normalizeMerchantName', () => {
  it('lowercases and keeps plain names as they are', () => {
    expect(normalizeMerchantName('Uber')).toBe('uber')
    expect(normalizeMerchantName('Whole Foods')).toBe('whole foods')
  })
  it('drops punctuation, digits and stars from statement text', () => {
    expect(normalizeMerchantName('UBER *TRIP 8005')).toBe('uber trip')
    expect(normalizeMerchantName('The Home Depot #4512')).toBe('home depot')
  })
  it('drops filler words like inc, llc, com and the', () => {
    expect(normalizeMerchantName('Amazon.com, Inc.')).toBe('amazon')
    expect(normalizeMerchantName('Acme Widgets LLC')).toBe('acme widgets')
  })
  it('joins apostrophes and spells out ampersands', () => {
    expect(normalizeMerchantName("Trader Joe's")).toBe('trader joes')
    expect(normalizeMerchantName('Barnes & Noble')).toBe(normalizeMerchantName('Barnes and Noble'))
  })
  it('removes card processor prefixes', () => {
    expect(normalizeMerchantName('SQ *BLUE BOTTLE')).toBe('blue bottle')
    expect(normalizeMerchantName('TST* Shake Shack')).toBe('shake shack')
  })
  it('strips accents and extra spaces', () => {
    expect(normalizeMerchantName('  Aeroméxico   ')).toBe('aeromexico')
  })
  it('gives an empty string when nothing is left', () => {
    expect(normalizeMerchantName('')).toBe('')
    expect(normalizeMerchantName('#76 ***')).toBe('')
  })
})
