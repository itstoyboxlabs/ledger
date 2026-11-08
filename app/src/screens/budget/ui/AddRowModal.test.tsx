import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { AddRowModal } from './AddRowModal'

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

const setup = () => {
  const fns = { onAdd: vi.fn(), onClose: vi.fn() }
  renderApp(<AddRowModal {...fns} />)
  return fns
}

describe('AddRowModal', () => {
  beforeEach(() => loadSampleData())
  it('focuses the name and keeps Add disabled until it has text', async () => {
    setup()
    const name = screen.getByPlaceholderText('e.g. Gym membership')
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    await userEvent.type(name, '   ')
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })
  it('adds a simple expense with a trimmed name and numeric amount', async () => {
    const { onAdd, onClose } = setup()
    await userEvent.type(screen.getByPlaceholderText('e.g. Gym membership'), '  Gym ')
    await userEvent.type(screen.getByPlaceholderText('0.00'), '42.5')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAdd).toHaveBeenCalledWith({ name: 'Gym', amount: 42.5, source: 'manual', type: 'simple' })
    expect(onClose).toHaveBeenCalled()
  })
  it('treats a blank amount as 0 and can target subscriptions', async () => {
    const { onAdd } = setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Subscriptions' }))
    await userEvent.type(screen.getByPlaceholderText('e.g. Gym membership'), 'Hulu{Enter}')
    expect(onAdd).toHaveBeenCalledWith({ name: 'Hulu', amount: 0, source: 'subscription', type: 'simple' })
  })
  it('builds a stack from its sub items', async () => {
    const { onAdd } = setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Stack with sub items' }))
    expect(screen.getByText('1 sub item')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText('e.g. Gym membership'), 'Pets')
    await userEvent.type(screen.getByLabelText(/Amount a month/), '30')
    expect(screen.getByText('$30')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    const row = onAdd.mock.calls[0][0]
    expect(row).toMatchObject({ name: 'Pets', amount: 30, source: 'manual', type: 'breakdown' })
    expect(row.items).toHaveLength(1)
  })
  it('Cancel closes without adding', async () => {
    const { onAdd, onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
    expect(onAdd).not.toHaveBeenCalled()
  })
})
