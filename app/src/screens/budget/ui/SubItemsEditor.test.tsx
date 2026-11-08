import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loadSampleData } from '@/test-utils/loadSampleData'
import type { SubItem } from '@/shared/types/SubItem'
import { SubItemsEditor } from './SubItemsEditor'

const items: SubItem[] = [
  { id: 'a', name: 'Produce', mode: 'month', amount: 120, perWeek: 0 },
  { id: 'b', name: 'Takeout', mode: 'week', amount: 15, perWeek: 2 },
]

describe('SubItemsEditor', () => {
  beforeEach(() => loadSampleData())
  it('shows an empty state with no items', () => {
    render(<SubItemsEditor items={[]} setItems={() => {}} />)
    expect(screen.getByText('No sub items yet.')).toBeInTheDocument()
  })
  it('shows each item and the weekly math line', () => {
    render(<SubItemsEditor items={items} setItems={() => {}} />)
    expect(screen.getByDisplayValue('Produce')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Takeout')).toBeInTheDocument()
    expect(screen.getByText(/\$15 × 2 × 4 = \$120 a month/)).toBeInTheDocument()
  })
  it('adds a blank sub item', async () => {
    const setItems = vi.fn()
    render(<SubItemsEditor items={items} setItems={setItems} />)
    await userEvent.click(screen.getByRole('button', { name: /Add sub item/ }))
    const next = setItems.mock.calls[0][0]
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ name: '', mode: 'month', amount: 0 })
  })
  it('removes the chosen item', async () => {
    const setItems = vi.fn()
    render(<SubItemsEditor items={items} setItems={setItems} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove sub item' })[0])
    expect(setItems).toHaveBeenCalledWith([items[1]])
  })
  it('renames an item', async () => {
    const setItems = vi.fn()
    render(<SubItemsEditor items={[items[0]]} setItems={setItems} />)
    await userEvent.type(screen.getByDisplayValue('Produce'), 's')
    expect(setItems).toHaveBeenLastCalledWith([{ ...items[0], name: 'Produces' }])
  })
  it('switches an item to per week', async () => {
    const setItems = vi.fn()
    render(<SubItemsEditor items={[items[0]]} setItems={setItems} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Per week' }))
    expect(setItems).toHaveBeenCalledWith([{ ...items[0], mode: 'week' }])
  })
  it('never lets an amount go below zero', async () => {
    const setItems = vi.fn()
    render(<SubItemsEditor items={[items[0]]} setItems={setItems} />)
    const input = screen.getByLabelText(/Amount a month/)
    await userEvent.clear(input)
    await userEvent.type(input, '-5')
    expect(setItems).toHaveBeenLastCalledWith([{ ...items[0], amount: 0 }])
  })
})
