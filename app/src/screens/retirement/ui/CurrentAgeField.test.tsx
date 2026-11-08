import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { persistedStore } from '@/shared/state/persistedStore'
import { CurrentAgeField } from './CurrentAgeField'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const set = (k: string, v: unknown) => localStorage.setItem(`ledger:${k}`, JSON.stringify(v))
const tipText = async () => {
  await userEvent.hover(screen.getByText('Current age').parentElement!.querySelector('[tabindex="0"]')!)
  return (await screen.findByRole('tooltip')).textContent
}

describe('CurrentAgeField', () => {
  it('is a plain typed field with no About you age', () => {
    renderApp(<CurrentAgeField typed={30} onChange={() => {}} />)
    expect(screen.getByLabelText(/Current age/)).toHaveValue(30)
    expect(screen.queryByRole('button', { name: 'Auto' })).toBeNull()
  })

  it('shows the age on the Balances date behind an Auto badge and says so', async () => {
    set('birthDate', '1981-12-01')
    set('assetsAsOf', '2026-10-31')
    renderApp(<CurrentAgeField typed={30} onChange={() => {}} />)
    expect(screen.getByText('44')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true')
    expect(await tipText()).toContain('Using your age on the day you last updated Balances (October 31, 2026). Update Balances to move it forward.')
  })

  it('says it uses today when Balances has no date', async () => {
    set('birthDate', '1981-12-01')
    renderApp(<CurrentAgeField typed={30} onChange={() => {}} />)
    expect(await tipText()).toContain('Using your age today')
  })

  it('says an old typed age is used as it is', async () => {
    set('age', { age: 44, asOf: 2024 })
    renderApp(<CurrentAgeField typed={30} onChange={() => {}} />)
    expect(screen.getByText('44')).toBeInTheDocument()
    expect(await tipText()).toContain('Using the age you typed on the About you tab. Add your birth date there')
  })

  it('lets you type your own age instead', async () => {
    set('birthDate', '1981-12-01')
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
