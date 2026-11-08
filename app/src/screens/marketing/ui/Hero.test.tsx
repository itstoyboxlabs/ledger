import { render, screen } from '@testing-library/react'
import { Hero } from '@/screens/marketing/ui/Hero'

describe('Hero', () => {
  it('has the headline and the app preview', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Ledger's Spending page/ })).toBeInTheDocument()
  })
})
