import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { FieldBadge } from './FieldBadge'

describe('FieldBadge', () => {
  it('shows its label and fires onClick', async () => {
    const onClick = vi.fn()
    renderApp(<FieldBadge label="Auto" active onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Auto' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it('reflects the active state in aria-pressed', () => {
    const { rerender } = renderApp(<FieldBadge label="Find" active={false} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Find' })).toHaveAttribute('aria-pressed', 'false')
    rerender(<FieldBadge label="Find" active onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Find' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('still renders a working button when a title is given', async () => {
    // the hover tooltip needs layout APIs jsdom lacks, so only the button is checked
    const onClick = vi.fn()
    renderApp(<FieldBadge label="Find" active={false} onClick={onClick} title="Finds the earliest age" />)
    await userEvent.click(screen.getByRole('button', { name: 'Find' }))
    expect(onClick).toHaveBeenCalled()
  })
})
