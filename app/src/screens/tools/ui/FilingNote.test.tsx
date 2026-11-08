import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilingNote } from './FilingNote'

beforeEach(() => localStorage.clear())

describe('FilingNote', () => {
  it('shows nothing for a single filer', () => {
    const { container } = render(<FilingNote onOpen={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('names Married filing jointly and links to About you', async () => {
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    const onOpen = vi.fn()
    render(<FilingNote onOpen={onOpen} />)
    expect(screen.getByText(/Using Married filing jointly from About you/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('leaves the link out when there is nowhere to go', () => {
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    render(<FilingNote />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
