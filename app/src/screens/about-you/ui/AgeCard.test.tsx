import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { AgeCard } from './AgeCard'

beforeEach(() => localStorage.clear())
const year = new Date().getFullYear()
const saved = () => JSON.parse(localStorage.getItem('ledger:age') ?? 'null')

describe('AgeCard', () => {
  it('starts empty and says Retirement keeps its own age', () => {
    renderApp(<AgeCard />)
    expect(screen.getByRole('heading', { level: 2, name: 'Your age' })).toBeInTheDocument()
    expect(screen.getByLabelText('Your age')).toHaveValue(null)
    expect(screen.getByText(/Retirement uses the age typed on that page/)).toBeInTheDocument()
  })

  it('saves a typed age with this year', () => {
    renderApp(<AgeCard />)
    fireEvent.change(screen.getByLabelText('Your age'), { target: { value: '42' } })
    expect(saved()).toEqual({ age: 42, asOf: year })
    expect(screen.getByText(`You are 42. Next January this becomes 43 by itself.`)).toBeInTheDocument()
  })

  it('shows the age today for an age typed in an earlier year', () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: year - 2 }))
    renderApp(<AgeCard />)
    expect(screen.getByLabelText('Your age')).toHaveValue(32)
    expect(screen.getByText(new RegExp(`You are 32 now. You typed 30 in ${year - 2}`))).toBeInTheDocument()
  })

  it('ignores an age out of range', () => {
    renderApp(<AgeCard />)
    fireEvent.change(screen.getByLabelText('Your age'), { target: { value: '400' } })
    expect(saved()).toBeNull()
  })

  it('clears the age', async () => {
    localStorage.setItem('ledger:age', JSON.stringify({ age: 30, asOf: year }))
    renderApp(<AgeCard />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear my age' }))
    expect(saved()).toBeNull()
    expect(screen.queryByRole('button', { name: 'Clear my age' })).not.toBeInTheDocument()
  })
})
