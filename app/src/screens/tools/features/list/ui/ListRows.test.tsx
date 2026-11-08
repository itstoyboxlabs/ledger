import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ListRows } from './ListRows'

const items = [
  { id: 'a', name: 'Bike', amount: 120 },
  { id: 'b', name: 'Desk', amount: 80.5 },
]

describe('ListRows', () => {
  it('shows each item and the total', () => {
    render(<ListRows items={items} onChange={() => {}} />)
    expect(screen.getByDisplayValue('Bike')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Desk')).toBeInTheDocument()
    expect(screen.getByText('$200.50')).toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })
  it('uses singular for one item and zero total when empty', () => {
    render(<ListRows items={[{ id: 'a', name: 'x', amount: 0 }]} onChange={() => {}} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })
  it('adds a blank item', async () => {
    const onChange = vi.fn()
    render(<ListRows items={items} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Add item/ }))
    const next = onChange.mock.calls[0][0]
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ name: '', amount: 0 })
  })
  it('removes an item', async () => {
    const onChange = vi.fn()
    render(<ListRows items={items} onChange={onChange} />)
    await userEvent.click(screen.getAllByTitle('Remove item')[0])
    expect(onChange).toHaveBeenCalledWith([items[1]])
  })
  it('edits a name', async () => {
    const onChange = vi.fn()
    render(<ListRows items={[items[0]]} onChange={onChange} />)
    await userEvent.type(screen.getByDisplayValue('Bike'), '!')
    expect(onChange).toHaveBeenLastCalledWith([{ ...items[0], name: 'Bike!' }])
  })
  it('Enter in a name adds a row', async () => {
    const onChange = vi.fn()
    render(<ListRows items={[items[0]]} onChange={onChange} />)
    await userEvent.type(screen.getByDisplayValue('Bike'), '{Enter}')
    expect(onChange.mock.calls[0][0]).toHaveLength(2)
  })
  it('clamps negative amounts to zero', async () => {
    const onChange = vi.fn()
    render(<ListRows items={[items[0]]} onChange={onChange} />)
    const amount = screen.getByDisplayValue('120')
    await userEvent.clear(amount)
    await userEvent.type(amount, '-5')
    expect(onChange).toHaveBeenLastCalledWith([{ ...items[0], amount: 0 }])
  })
})
