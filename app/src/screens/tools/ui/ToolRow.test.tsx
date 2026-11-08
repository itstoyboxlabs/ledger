import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { Table, TableBody } from '@/shared/ui/primitives/table'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { ToolRow } from './ToolRow'

const wrap = (ui: ReactElement) => render(<TooltipProvider><Table><TableBody>{ui}</TableBody></Table></TooltipProvider>)

describe('ToolRow', () => {
  it('shows label and value', () => {
    wrap(<ToolRow label="Rent" value="$1,000.00" />)
    expect(screen.getByText('Rent')).toBeInTheDocument()
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
  })
  it('bold rows get semibold text', () => {
    wrap(<ToolRow label="Total" value="$5" bold />)
    expect(screen.getByText('$5').className).toContain('font-semibold')
    expect(screen.getByText('Total').closest('td')?.className).toContain('font-semibold')
  })
  it('applies the tone color to the value', () => {
    wrap(<ToolRow label="Left" value="$9" tone="rgb(255, 0, 0)" />)
    expect(screen.getByText('$9')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })
  it('renders an info tip only when given', () => {
    const { container, rerender } = wrap(<ToolRow label="A" value="1" />)
    const before = container.querySelectorAll('svg, button').length
    rerender(<TooltipProvider><Table><TableBody><ToolRow label="A" value="1" tip="Hello" /></TableBody></Table></TooltipProvider>)
    expect(container.querySelectorAll('svg, button').length).toBeGreaterThan(before)
  })
})
