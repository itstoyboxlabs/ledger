import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { NeedPerMonthField } from './NeedPerMonthField'
import type { RetireNeed } from '@/screens/retirement/types/RetireNeed'

const OPTS = [{ name: 'Retirement', monthly: 3200 }, { name: 'Lean', monthly: 2100 }]
const typedNeed: RetireNeed = { monthly: 5000, status: 'typed', preset: null }
const base = { value: 5000, onChange: () => {}, need: typedNeed, options: OPTS, today: 4100, onPick: () => {} }

describe('NeedPerMonthField', () => {
  beforeAll(() => {
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  })

  it('is a typed field by default, with today\'s Budget under it', () => {
    renderApp(<NeedPerMonthField {...base} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(5000)
    expect(screen.getByText('Your Budget today: $4,100 a month')).toBeInTheDocument()
    expect(screen.queryByText(/From the/)).toBeNull()
  })

  it('lists Budget presets with their totals and picks one', async () => {
    const onPick = vi.fn()
    renderApp(<NeedPerMonthField {...base} onPick={onPick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Use a Budget preset' }))
    expect(screen.getByRole('menuitem', { name: /Lean/ })).toHaveTextContent('$2,100')
    await userEvent.click(screen.getByRole('menuitem', { name: /Retirement/ }))
    expect(onPick).toHaveBeenCalledWith('Retirement')
  })

  it('Type it in clears the pick', async () => {
    const onPick = vi.fn()
    renderApp(<NeedPerMonthField {...base} need={{ monthly: 3200, status: 'preset', preset: 'Retirement' }} onPick={onPick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Use a Budget preset' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Type it in' }))
    expect(onPick).toHaveBeenCalledWith(null)
  })

  it('shows the preset value read-only with a From badge', () => {
    renderApp(<NeedPerMonthField {...base} need={{ monthly: 3200, status: 'preset', preset: 'Retirement' }} />)
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByText('$3,200')).toBeInTheDocument()
    expect(screen.getByText('From the Retirement preset: $3,200 a month')).toBeInTheDocument()
  })

  it('says when the preset is gone, and typing clears the pick', async () => {
    const onPick = vi.fn()
    const onChange = vi.fn()
    renderApp(<NeedPerMonthField {...base} value={4000} need={{ monthly: 4000, status: 'missing', preset: 'Old' }} onPick={onPick} onChange={onChange} />)
    expect(screen.getByText('The Old preset is gone, so this uses your typed number.')).toBeInTheDocument()
    await userEvent.type(screen.getByRole('spinbutton'), '5')
    expect(onPick).toHaveBeenCalledWith(null)
    expect(onChange).toHaveBeenCalled()
  })

  it('says how to make a preset when there are none, and hides the Budget line with no Budget', async () => {
    renderApp(<NeedPerMonthField {...base} options={[]} today={null} />)
    expect(screen.queryByText(/Your Budget today/)).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Use a Budget preset' }))
    expect(screen.getByText('No Budget presets yet. Save one on Budget.')).toBeInTheDocument()
  })
})
