import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SourceBadge } from './SourceBadge'

const OPTIONS = [{ value: 'today', label: "Today's Take-home" }, { value: 'p1', label: 'Easier job' }, { value: 'typed', label: 'Type it in' }]

describe('SourceBadge', () => {
  it('shows the short source and lists the choices', async () => {
    const onPick = vi.fn()
    render(<SourceBadge title="Take-home preset" owner="Now" value="today" short="Today's Take-home" options={OPTIONS} onPick={onPick} />)
    const pill = screen.getByRole('button', { name: "Take-home preset for Now: Today's Take-home" })
    await userEvent.click(pill)
    expect(await screen.findByText('Take-home preset')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Easier job' }))
    expect(onPick).toHaveBeenCalledWith('p1')
  })
})
