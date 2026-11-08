import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STATES } from '@/shared/constants/STATES'
import { TaxedInCaption } from './TaxedInCaption'

describe('TaxedInCaption', () => {
  it('names the state', () => {
    render(<TaxedInCaption state="ny" onChange={() => {}} />)
    expect(screen.getByText(new RegExp(`Taxed in ${STATES.ny.label}`))).toBeInTheDocument()
  })
  it('calls onChange from the Change button', async () => {
    const onChange = vi.fn()
    render(<TaxedInCaption state="ny" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
  it('does not crash on an unknown state', () => {
    render(<TaxedInCaption state="zz" onChange={() => {}} />)
    expect(screen.getByText(/Taxed in/)).toBeInTheDocument()
  })
})
