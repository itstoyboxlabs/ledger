import { donutSegments } from '@/screens/marketing/utils/donutSegments'

describe('donutSegments', () => {
  const cats = [
    { name: 'A', amount: 50, color: '#111' },
    { name: 'B', amount: 50, color: '#222' },
  ]

  it('starts at the top and walks backwards by each share', () => {
    const [a, b] = donutSegments(cats, 100)
    expect(a.dashOffset).toBe(25)
    expect(b.dashOffset).toBe(-25)
  })

  it('leaves a small gap after each segment', () => {
    const [a] = donutSegments(cats, 100)
    expect(a.dashArray).toBe('49.4 50.6')
    expect(a.color).toBe('#111')
  })

  it('never draws a segment shorter than a hairline', () => {
    const [a] = donutSegments([{ name: 'tiny', amount: 0.1, color: '#000' }], 100)
    expect(a.dashArray).toBe('0.2 99.8')
  })
})
