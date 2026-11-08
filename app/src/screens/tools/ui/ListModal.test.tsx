import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { ListModal } from './ListModal'

describe('ListModal', () => {
  it('creates a list: Add list is disabled until titled', async () => {
    const onSave = vi.fn()
    renderApp(<ListModal onSave={onSave} onClose={() => {}} />)
    expect(screen.getByText('Add a list')).toBeInTheDocument()
    const add = screen.getByRole('button', { name: 'Add list' })
    expect(add).toBeDisabled()
    await userEvent.type(screen.getByPlaceholderText('Gift ideas'), '  Gifts  ')
    expect(add).toBeEnabled()
    await userEvent.type(screen.getByPlaceholderText('A short note about this list'), ' note ')
    await userEvent.click(add)
    const saved = onSave.mock.calls[0][0]
    expect(saved).toMatchObject({ title: 'Gifts', description: 'note' })
    expect(saved.id).toBeTruthy()
    expect(saved.items).toHaveLength(1)
  })
  it('whitespace-only title keeps save disabled', async () => {
    renderApp(<ListModal onSave={() => {}} onClose={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText('Gift ideas'), '   ')
    expect(screen.getByRole('button', { name: 'Add list' })).toBeDisabled()
  })
  it('edits an existing list and keeps its id', async () => {
    const onSave = vi.fn()
    const initial = { id: 'keep', title: 'Old', description: '', items: [{ id: 'a', name: 'x', amount: 5 }] }
    renderApp(<ListModal initial={initial} onSave={onSave} onClose={() => {}} />)
    expect(screen.getByText('Edit list')).toBeInTheDocument()
    await userEvent.type(screen.getByDisplayValue('Old'), 'er')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith({ id: 'keep', title: 'Older', description: '', items: initial.items })
  })
  it('Cancel closes without saving', async () => {
    const onSave = vi.fn(), onClose = vi.fn()
    renderApp(<ListModal onSave={onSave} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })
})
