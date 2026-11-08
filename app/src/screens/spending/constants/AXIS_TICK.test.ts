import { AXIS_TICK } from '@/screens/spending/constants/AXIS_TICK'

describe('AXIS_TICK', () => {
  it('pins the chart tick style', () => {
    expect(AXIS_TICK).toEqual({ fill: '#8690ab', fontSize: 11 })
  })
})
