import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'
import { AboutYouView } from './AboutYouView'

beforeEach(() => localStorage.clear())

describe('AboutYouView', () => {
  it('explains the page and shows the three cards', () => {
    renderApp(<AboutYouView />)
    expect(screen.getByText(/This is the starting point for planning/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Your age' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Filing status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Tax state and city/ })).toBeInTheDocument()
  })

  it('has no partner fields', () => {
    renderApp(<AboutYouView />)
    expect(screen.queryByText(/partner'?s? (age|income|salary)/i)).not.toBeInTheDocument()
  })
})
