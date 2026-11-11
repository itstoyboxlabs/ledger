import { render, screen } from '@testing-library/react'
import { LandingPage } from '@/screens/marketing/ui/LandingPage'

describe('LandingPage', () => {
  it('shows the hero and links to the app and the repo', () => {
    render(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Financial planning that doesn't oversimplify you.")
    expect(screen.getAllByRole('link', { name: 'Try Ledger' })[0]).toHaveAttribute('href', '/app')
    expect(screen.getAllByRole('link', { name: /GitHub/ })[0]).toHaveAttribute('href', 'https://github.com/itstoyboxlabs/ledger')
  })
  it('has every section the nav links to', () => {
    const { container } = render(<LandingPage />)
    for (const id of ['features', 'how', 'open-source', 'faq']) expect(container.querySelector(`#${id}`)).not.toBeNull()
  })
  it('stacks five feature cards and has no tabs', () => {
    const { container } = render(<LandingPage />)
    expect(container.querySelectorAll('article.fcard')).toHaveLength(5)
    expect(screen.queryByRole('tab')).toBeNull()
  })
})
