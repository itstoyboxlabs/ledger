import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { persistedStore } from '@/shared/state/persistedStore'
import { CurrentAgeField } from './CurrentAgeField'

const year = new Date().getFullYear()
beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})

describe('CurrentAgeField', () => {
  it('is a plain typed field with no About you age', () => {
    renderApp(<CurrentAgeField typed={30} onChange={() => {}} />)
    expect(screen.getByLabelText(/Current age/)).toHaveValue(30)
    expect(screen.queryByRole('button', { name: 'Auto' })).toBeNull()
  })

  it('shows the About you age behind an Auto badge', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 44, asOf: year }))
    renderApp(<CurrentAgeField typed={30} onChange={() => {}} />)
    expect(screen.getByText('44')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('lets you type your own age instead', async () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 44, asOf: year }))
    const onChange = vi.fn()
    renderApp(<CurrentAgeField typed={30} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Auto' }))
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(30)
    await userEvent.clear(input)
    await userEvent.type(input, '31')
    expect(onChange).toHaveBeenLastCalledWith(31)
  })
})
