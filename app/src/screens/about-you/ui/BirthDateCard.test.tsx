import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { persistedStore } from '@/shared/state/persistedStore'
import { ageOn } from '@/shared/utils/ageOn'
import { todayIso } from '@/shared/utils/todayIso'
import { BirthDateCard } from './BirthDateCard'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
})
const saved = (k: string) => JSON.parse(localStorage.getItem(`ledger:${k}`) ?? 'null')
const box = () => screen.getByLabelText('Birth date')

describe('BirthDateCard', () => {
  it('starts empty, explains why it asks and says Retirement keeps its own age', () => {
    renderApp(<BirthDateCard />)
    expect(screen.getByRole('heading', { level: 2, name: 'Your birth date' })).toBeInTheDocument()
    expect(box()).toHaveValue('')
    expect(box()).toHaveAttribute('placeholder', 'MM-DD-YYYY')
    expect(screen.getByText(/stored only on this device and in the file you export/)).toBeInTheDocument()
    expect(screen.getByText(/Retirement uses your age on the day you last updated Balances, not today/)).toBeInTheDocument()
    expect(screen.getByText(/Retirement uses the age typed on that page/)).toBeInTheDocument()
  })

  it('saves a typed MM-DD-YYYY date and shows the age today', async () => {
    renderApp(<BirthDateCard />)
    await userEvent.type(box(), '04-15-1990')
    expect(saved('birthDate')).toBe('1990-04-15')
    expect(screen.getByText(`You are ${ageOn('1990-04-15', todayIso())} today.`)).toBeInTheDocument()
    fireEvent.blur(box())
    expect(box()).toHaveValue('04-15-1990')
  })

  it('accepts slashes and shows the date back with dashes', () => {
    renderApp(<BirthDateCard />)
    fireEvent.change(box(), { target: { value: '4/5/1990' } })
    fireEvent.blur(box())
    expect(saved('birthDate')).toBe('1990-04-05')
    expect(box()).toHaveValue('04-05-1990')
  })

  it('waits for a full date before showing an error, then shows it on blur', () => {
    renderApp(<BirthDateCard />)
    fireEvent.change(box(), { target: { value: '04-1' } })
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.blur(box())
    expect(screen.getByRole('alert')).toHaveTextContent('Type your birth date as MM-DD-YYYY, like 04-15-1990.')
    expect(box()).toHaveValue('04-1')
    expect(box()).toHaveAttribute('aria-invalid', 'true')
    expect(saved('birthDate')).toBeNull()
  })

  it('shows an error for a date that does not exist or is in the future', () => {
    renderApp(<BirthDateCard />)
    fireEvent.change(box(), { target: { value: '02-30-1990' } })
    expect(screen.getByRole('alert')).toHaveTextContent('That date does not exist.')
    fireEvent.change(box(), { target: { value: `01-01-${new Date().getFullYear() + 1}` } })
    expect(screen.getByRole('alert')).toHaveTextContent('That date is in the future.')
    fireEvent.change(box(), { target: { value: '01-01-1850' } })
    expect(screen.getByRole('alert')).toHaveTextContent('older than 120')
    expect(saved('birthDate')).toBeNull()
  })

  it('shows an old typed age until a birth date replaces it', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: 2024 }))
    renderApp(<BirthDateCard />)
    expect(screen.getByText(/You typed your age as 30 before Ledger asked for a birth date/)).toBeInTheDocument()
    fireEvent.change(box(), { target: { value: '04-15-1990' } })
    expect(saved('age')).toBeNull()
    expect(screen.queryByText(/You typed your age as 30/)).toBeNull()
  })

  it('clears the birth date', async () => {
    localStorage.setItem('ledger:birthDate', JSON.stringify('1990-04-15'))
    renderApp(<BirthDateCard />)
    expect(box()).toHaveValue('04-15-1990')
    await userEvent.click(screen.getByRole('button', { name: 'Clear my birth date' }))
    expect(saved('birthDate')).toBeNull()
    expect(box()).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Clear my birth date' })).not.toBeInTheDocument()
  })

  it('clears when the box is emptied and left', () => {
    localStorage.setItem('ledger:birthDate', JSON.stringify('1990-04-15'))
    renderApp(<BirthDateCard />)
    fireEvent.focus(box())
    fireEvent.change(box(), { target: { value: '' } })
    fireEvent.blur(box())
    expect(saved('birthDate')).toBeNull()
  })
})
