import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table, TableHeader, TableRow } from '@/shared/ui/primitives/table'
import { SortHead } from './SortHead'

const setup = (props: Partial<ComponentProps<typeof SortHead>>) => {
  const onSort = vi.fn()
  render(<Table><TableHeader><TableRow><SortHead id="amt" label="Amount" sort={{ key: 'date', dir: 'asc' }} onSort={onSort} {...props} /></TableRow></TableHeader></Table>)
  return onSort
}

describe('SortHead', () => {
  it('calls onSort with its id when clicked', async () => {
    const onSort = setup({ sort: { key: 'date', dir: 'asc' } })
    await userEvent.click(screen.getByRole('columnheader'))
    expect(onSort).toHaveBeenCalledWith('amt')
  })

  it('has no aria-sort when inactive', () => {
    setup({ sort: { key: 'date', dir: 'asc' } })
    expect(screen.getByRole('columnheader')).not.toHaveAttribute('aria-sort')
  })

  it('shows an up arrow and ascending when active asc', () => {
    setup({ sort: { key: 'amt', dir: 'asc' } })
    const h = screen.getByRole('columnheader')
    expect(h).toHaveAttribute('aria-sort', 'ascending')
    expect(h).toHaveTextContent('Amount ↑')
  })

  it('shows a down arrow and descending when active desc', () => {
    setup({ sort: { key: 'amt', dir: 'desc' }, right: true })
    const h = screen.getByRole('columnheader')
    expect(h).toHaveAttribute('aria-sort', 'descending')
    expect(h).toHaveTextContent('↓')
    expect(h).toHaveClass('text-right')
  })
})
