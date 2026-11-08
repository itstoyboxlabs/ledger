import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { LogMeter } from './LogMeter'

const row = { id: 'b006', name: 'Restaurants', amount: 260 }

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

describe('LogMeter', () => {
  beforeEach(() => loadSampleData())
  it('shows spent of budget and what is left', () => {
    renderApp(<LogMeter row={row} spent={60} onHide={() => {}} />)
    expect(screen.getByText('Restaurants')).toBeInTheDocument()
    expect(screen.getByText(/of \$260/)).toBeInTheDocument()
    expect(screen.getByText('$200 left')).toBeInTheDocument()
  })
  it('shows how far over when spent exceeds the budget', () => {
    renderApp(<LogMeter row={row} spent={300} onHide={() => {}} />)
    expect(screen.getByText('$40 over')).toBeInTheDocument()
  })
  it('is not over at exactly the budget', () => {
    renderApp(<LogMeter row={row} spent={260} onHide={() => {}} />)
    expect(screen.getByText('$0 left')).toBeInTheDocument()
  })
  it('handles a zero budget and a credit without crashing', () => {
    renderApp(<LogMeter row={{ ...row, amount: 0 }} spent={-20} onHide={() => {}} />)
    expect(screen.getByText('$20 left')).toBeInTheDocument()
  })
  it('calls onHide from the hide button', async () => {
    const onHide = vi.fn()
    renderApp(<LogMeter row={row} spent={10} onHide={onHide} />)
    await userEvent.click(screen.getByRole('button', { name: 'Hide the Restaurants meter' }))
    expect(onHide).toHaveBeenCalledTimes(1)
  })
})
