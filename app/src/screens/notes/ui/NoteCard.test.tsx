import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteCard } from './NoteCard'

const note = { id: 'n1', text: 'Call landlord', createdAt: new Date(2026, 10, 8, 12).getTime(), pinned: false }

describe('NoteCard', () => {
  it('shows the date and text', () => {
    render(<NoteCard note={note} onChange={() => {}} onDelete={() => {}} onTogglePin={() => {}} />)
    expect(screen.getByText('Nov 8, 2026')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('Call landlord')
  })
  it('debounces edits before calling onChange', async () => {
    const onChange = vi.fn()
    render(<NoteCard note={note} onChange={onChange} onDelete={() => {}} onTogglePin={() => {}} />)
    await userEvent.type(screen.getByRole('textbox'), '!')
    expect(onChange).not.toHaveBeenCalled()
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('Call landlord!'), { timeout: 2000 })
    expect(onChange).toHaveBeenCalledTimes(1)
  })
  it('wires the pin and delete buttons', async () => {
    const onDelete = vi.fn(), onTogglePin = vi.fn()
    render(<NoteCard note={note} onChange={() => {}} onDelete={onDelete} onTogglePin={onTogglePin} />)
    await userEvent.click(screen.getByTitle('Pin to top'))
    await userEvent.click(screen.getByTitle('Delete note'))
    expect(onTogglePin).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
  it('offers Unpin on a pinned note', () => {
    render(<NoteCard note={{ ...note, pinned: true }} onChange={() => {}} onDelete={() => {}} onTogglePin={() => {}} />)
    expect(screen.getByTitle('Unpin')).toBeInTheDocument()
  })
  it('resets the draft when a different note is shown', () => {
    const { rerender } = render(<NoteCard note={note} onChange={() => {}} onDelete={() => {}} onTogglePin={() => {}} />)
    rerender(<NoteCard note={{ ...note, id: 'n2', text: 'Other' }} onChange={() => {}} onDelete={() => {}} onTogglePin={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('Other')
  })
})
