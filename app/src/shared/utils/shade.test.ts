import { shade } from './shade'

describe('shade', () => {
  it('returns the same colour at 0', () => {
    expect(shade('#336699', 0)).toBe('#336699')
  })
  it('returns white at 1', () => {
    expect(shade('#336699', 1)).toBe('#ffffff')
    expect(shade('#000000', 1)).toBe('#ffffff')
  })
  it('lightens halfway and rounds', () => {
    expect(shade('#000000', 0.5)).toBe('#808080')
    expect(shade('#ff0000', 0.5)).toBe('#ff8080')
  })
  it('keeps white white and pads hex digits', () => {
    expect(shade('#ffffff', 0.3)).toBe('#ffffff')
    expect(shade('#000000', 0.02)).toBe('#050505')
  })
})
