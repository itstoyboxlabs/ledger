import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { InfoTip } from './InfoTip'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
})

describe('InfoTip', () => {
  it('shows the tip on focus', async () => {
    const { container } = render(<TooltipProvider><InfoTip tip="Explains things" /></TooltipProvider>)
    expect(screen.queryByText('Explains things')).toBeNull()
    await userEvent.tab()
    expect(container.querySelector('span[tabindex="0"]')).toHaveFocus()
    expect((await screen.findAllByText('Explains things')).length).toBeGreaterThan(0)
  })

  it('uses the given icon size', () => {
    const { container } = render(<TooltipProvider><InfoTip tip="x" size={20} /></TooltipProvider>)
    expect(container.querySelector('svg')).toHaveAttribute('width', '20')
  })
})
