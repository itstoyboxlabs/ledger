import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ListTool } from './ListTool'

const list = { id: 'l', title: 'Gifts', description: 'For mom', items: [{ id: 'a', name: 'Scarf', amount: 30 }] }

describe('ListTool', () => {
  it('shows title, description, items and total', () => {
    render(<ListTool list={list} onChange={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Gifts' })).toBeInTheDocument()
    expect(screen.getByText('For mom')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Scarf')).toBeInTheDocument()
    expect(screen.getByText('$30.00')).toBeInTheDocument()
  })
  it('falls back to Untitled list and hides empty description', () => {
    render(<ListTool list={{ ...list, title: '', description: '' }} onChange={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Untitled list' })).toBeInTheDocument()
    expect(screen.queryByText('For mom')).toBeNull()
  })
  it('fires edit and delete', async () => {
    const onEdit = vi.fn(), onDelete = vi.fn()
    render(<ListTool list={list} onChange={() => {}} onEdit={onEdit} onDelete={onDelete} />)
    await userEvent.click(screen.getByTitle('Edit title and description'))
    await userEvent.click(screen.getByTitle('Delete list'))
    expect(onEdit).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalled()
  })
  it('reports item changes with the whole list', async () => {
    const onChange = vi.fn()
    render(<ListTool list={list} onChange={onChange} onEdit={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /Add item/ }))
    expect(onChange.mock.calls[0][0]).toMatchObject({ id: 'l', title: 'Gifts' })
    expect(onChange.mock.calls[0][0].items).toHaveLength(2)
  })
})
