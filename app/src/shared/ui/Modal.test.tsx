import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders title, description, action and children', () => {
    render(<Modal onClose={() => {}} title="Hello" description="Details" action={<button>Act</button>}>Body text</Modal>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument()
    expect(screen.getByText('Body text')).toBeInTheDocument()
  })

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(<Modal onClose={onClose} title="T">x</Modal>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('omits the description when not given', () => {
    render(<Modal onClose={() => {}} title="T">x</Modal>)
    expect(screen.getByRole('dialog')).toHaveTextContent('T')
  })
})
