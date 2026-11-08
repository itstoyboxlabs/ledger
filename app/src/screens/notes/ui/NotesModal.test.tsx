import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'

const SEED_NOTES = [
  { id: 'a', text: 'Older note', createdAt: 1000, pinned: false },
  { id: 'b', text: 'Newer note', createdAt: 2000, pinned: false },
  { id: 'c', text: 'Pinned old', createdAt: 500, pinned: true },
]

import { NotesModal } from './NotesModal'
import { getNotes } from '@/shared/utils/getNotes'

beforeEach(() => seedStorage({ notes: { notes: SEED_NOTES } }))

describe('NotesModal', () => {
  it('lists pinned first, then newest first', async () => {
    renderApp(<NotesModal onClose={() => {}} />)
    await screen.findByDisplayValue('Pinned old')
    const texts = screen.getAllByRole('textbox').slice(1).map((t) => (t as HTMLTextAreaElement).value).filter((t) => /note|old/.test(t))
    expect(texts).toEqual(['Pinned old', 'Newer note', 'Older note'])
  })
  it('keeps Add disabled until there is text, then adds and saves', async () => {
    renderApp(<NotesModal onClose={() => {}} />)
    await screen.findByDisplayValue('Pinned old')
    const add = screen.getByRole('button', { name: 'Add' })
    expect(add).toBeDisabled()
    await userEvent.type(screen.getByPlaceholderText(/New note/), '  Pay rent  ')
    expect(add).toBeEnabled()
    await userEvent.click(add)
    expect(screen.getByDisplayValue('Pay rent')).toBeInTheDocument()
    await waitFor(async () => expect((await getNotes()).notes.some((n) => n.text === 'Pay rent')).toBe(true), { timeout: 2000 })
    const saved = (await getNotes()).notes
    expect(saved.some((n) => n.text === 'Pay rent' && n.pinned === false)).toBe(true)
  })
  it('deletes a note', async () => {
    renderApp(<NotesModal onClose={() => {}} />)
    await screen.findByDisplayValue('Newer note')
    const card = screen.getByDisplayValue('Newer note').closest('.group') as HTMLElement
    await userEvent.click(within(card).getByTitle('Delete note'))
    expect(screen.queryByDisplayValue('Newer note')).not.toBeInTheDocument()
  })
  it('calls onClose from Close and Escape', async () => {
    const onClose = vi.fn()
    renderApp(<NotesModal onClose={onClose} />)
    await screen.findByDisplayValue('Newer note')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
    onClose.mockClear()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
