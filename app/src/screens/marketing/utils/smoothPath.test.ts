import { smoothPath } from '@/screens/marketing/utils/smoothPath'

describe('smoothPath', () => {
  it('starts at the first point and ends at the last', () => {
    const d = smoothPath([[0, 10], [10, 20], [20, 10]])
    expect(d.startsWith('M0,10 C')).toBe(true)
    expect(d.endsWith(' 20,10')).toBe(true)
  })

  it('has one curve per segment', () => {
    expect(smoothPath([[0, 0], [1, 1], [2, 0], [3, 1]]).match(/C/g)).toHaveLength(3)
  })
})
