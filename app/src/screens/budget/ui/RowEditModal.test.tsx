import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData } from '@/test-utils/loadSampleData'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import { RowEditModal } from './RowEditModal'

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

const stack: BudgetRow = {
  id: 'b006', name: 'Restaurants', type: 'breakdown', amount: 260,
  items: [{ id: 'r1', name: 'Sit-down', mode: 'week', amount: 35, perWeek: 1 }, { id: 'r2', name: 'Takeout', mode: 'week', amount: 15, perWeek: 2 }],
}
const simple: BudgetRow = { id: 'b001', name: 'Rent', type: 'simple', amount: 1850 }
const setup = (row: BudgetRow, props = {}) => {
  const fns = { onChange: vi.fn(), onCancel: vi.fn(), onClose: vi.fn() }
  renderApp(<RowEditModal row={row} {...fns} {...props} />)
  return fns
}

describe('RowEditModal', () => {
  beforeEach(() => loadSampleData())
  it('shows the sub items count and total for a stack', () => {
    setup(stack)
    expect(screen.getByText('Restaurants')).toBeInTheDocument()
    expect(screen.getByText('2 sub items')).toBeInTheDocument()
    expect(screen.getByText('$260')).toBeInTheDocument()
  })
  it('shows the amount only for a simple row', () => {
    setup(simple)
    expect(screen.getByText('$1,850')).toBeInTheDocument()
    expect(screen.queryByText(/^\d+ sub item/)).not.toBeInTheDocument()
  })
  it('turns a simple row into a stack that keeps the existing amount', async () => {
    const { onChange } = setup(simple)
    await userEvent.click(screen.getByRole('tab', { name: 'Stack with sub items' }))
    const patch = onChange.mock.calls[0][0]
    expect(patch.type).toBe('breakdown')
    expect(patch.items).toHaveLength(1)
    expect(patch.items[0]).toMatchObject({ name: 'Existing amount', amount: 1850 })
    expect(patch.amount).toBe(1850)
  })
  it('turns a stack back to simple using the item total', async () => {
    const { onChange } = setup(stack)
    await userEvent.click(screen.getByRole('tab', { name: 'Simple' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'simple', items: undefined, amount: 260 })
  })
  it('writes item removal straight to the row with the new total', async () => {
    const { onChange } = setup(stack)
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove sub item' })[0])
    expect(onChange).toHaveBeenCalledWith({ items: [stack.items![1]], amount: 120 })
  })
  it('hides the type tabs for a subscription row', () => {
    setup({ ...simple, source: 'subscription' })
    expect(screen.queryByRole('tab', { name: 'Simple' })).not.toBeInTheDocument()
  })
  it('Cancel and Done call their handlers', async () => {
    const { onCancel, onClose } = setup(simple)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
