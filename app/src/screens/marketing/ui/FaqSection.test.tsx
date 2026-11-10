import { render, screen } from '@testing-library/react'
import { FaqSection } from '@/screens/marketing/ui/FaqSection'

describe('FaqSection', () => {
  it('has seven questions with answers', () => {
    const { container } = render(<FaqSection />)
    expect(container.querySelectorAll('details')).toHaveLength(7)
    expect(screen.getByText('Does it cost anything?')).toBeInTheDocument()
  })
  it('describes one ledger-data.json file and no separate settings file', () => {
    const { container } = render(<FaqSection />)
    expect(container.textContent).toContain('Give that file to your assistant with the new statements')
    expect(container.textContent).not.toMatch(/settings backup|ledger-settings|both files/)
  })
})
