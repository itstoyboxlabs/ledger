import { render } from '@testing-library/react'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { renderActiveShape } from '@/screens/spending/utils/renderActiveShape'

describe('renderActiveShape', () => {
  it('draws a sector 6px larger than the slice', () => {
    const props: PieSectorDataItem = { cx: 100, cy: 100, innerRadius: 50, outerRadius: 80, startAngle: 0, endAngle: 90, fill: '#f00' } as unknown as PieSectorDataItem
    const { container } = render(<svg>{renderActiveShape(props)}</svg>)
    const path = container.querySelector('path')
    expect(path).toBeTruthy()
    // path arc commands use the enlarged outer radius
    expect(path?.getAttribute('d')).toMatch(/A 86,86/)
  })
})
