import { logTracked } from './logTracked'

describe('logTracked', () => {
  it('trackInLog wins either way', () => {
    expect(logTracked({ trackInLog: false, day: null }, true)).toBe(false)
    expect(logTracked({ trackInLog: true, day: 5 }, false)).toBe(true)
  })
  it('rows without a billing day are tracked', () => {
    expect(logTracked({ day: null }, false)).toBe(true)
    expect(logTracked({}, false)).toBe(true)
  })
  it('rows with a billing day are tracked only when entries exist', () => {
    expect(logTracked({ day: 1 }, false)).toBe(false)
    expect(logTracked({ day: 1 }, true)).toBe(true)
  })
  it('day 0 counts as a billing day', () => {
    expect(logTracked({ day: 0 }, false)).toBe(false)
  })
})
