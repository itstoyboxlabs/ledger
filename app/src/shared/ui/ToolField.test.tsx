import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { ToolField } from './ToolField'

const setup = (props: Partial<ComponentProps<typeof ToolField>> = {}) => render(<TooltipProvider><ToolField label="Rate" value={3} onChange={() => {}} {...props} /></TooltipProvider>)

describe('ToolField', () => {
  it('labels the number input', () => {
    setup()
    expect(screen.getByLabelText(/Rate/)).toHaveValue(3)
  })

  it('shows the suffix and an info tip when given', () => {
    const { container } = setup({ suffix: 'yrs', tip: 'Help text' })
    expect(screen.getByText('yrs')).toBeInTheDocument()
    expect(container.querySelector('[tabindex="0"] svg')).toBeInTheDocument()
  })

  it('reports typed numbers', async () => {
    const onChange = vi.fn()
    setup({ onChange })
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '8')
    expect(onChange).toHaveBeenLastCalledWith(8)
  })
})
