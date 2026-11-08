import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { AutoToolField } from './AutoToolField'

const base = { label: 'Savings a year', autoTip: 'From your budget.', value: 100, autoValue: 12345, onChange: () => {}, onToggleAuto: () => {} }

describe('AutoToolField', () => {
  it('shows the formatted auto value and no input when auto is on', () => {
    renderApp(<AutoToolField {...base} auto />)
    expect(screen.getByText('$12,345')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('shows an editable input with the typed value when auto is off', () => {
    renderApp(<AutoToolField {...base} auto={false} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(100)
    expect(screen.queryByText('$12,345')).toBeNull()
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'false')
  })
  it('calls onChange when typing', async () => {
    const onChange = vi.fn()
    renderApp(<AutoToolField {...base} auto={false} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '250')
    expect(onChange).toHaveBeenLastCalledWith(250)
  })
  it('toggles auto from the badge', async () => {
    const onToggleAuto = vi.fn()
    renderApp(<AutoToolField {...base} auto onToggleAuto={onToggleAuto} />)
    await userEvent.click(screen.getByRole('button', { name: 'Auto' }))
    expect(onToggleAuto).toHaveBeenCalled()
  })
  it('uses a custom format function', () => {
    renderApp(<AutoToolField {...base} auto autoValue={15} format={(v) => `${v}%`} />)
    expect(screen.getByText('15%')).toBeInTheDocument()
  })
})
