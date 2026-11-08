import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { CoverageDot } from './CoverageDot'
import { loadSampleData } from '@/test-utils/loadSampleData'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
})
beforeEach(() => loadSampleData())
const setup = (month: string) => render(<TooltipProvider><CoverageDot month={month} /></TooltipProvider>)

describe('CoverageDot', () => {
  it('is green when every account has the whole month', () => {
    const { container } = setup('2026-06')
    expect(container.querySelector('span span')?.getAttribute('style')).toContain('--good')
  })

  it('is yellow when statements are missing', () => {
    const { container } = setup('2030-01')
    expect(container.querySelector('span span')?.getAttribute('style')).toContain('rgb(232, 199, 106)')
  })

  it('lists the missing accounts in the tooltip', async () => {
    const { container } = setup('2030-01')
    await userEvent.hover(container.firstChild as Element)
    const tips = await screen.findAllByText(/Missing: Checking, Maple Card/)
    expect(tips.length).toBeGreaterThan(0)
  })
})
