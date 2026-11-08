import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { ToolPicker } from './ToolPicker'

beforeEach(() => localStorage.clear())

describe('ToolPicker', () => {
  it('shows how many of the tools are on', () => {
    renderApp(<ToolPicker />)
    expect(screen.getByRole('button', { name: /What to show/ })).toHaveTextContent('9/9')
  })
  it('opens a modal with a card per tool', async () => {
    renderApp(<ToolPicker />)
    await userEvent.click(screen.getByRole('button', { name: /What to show/ }))
    expect(screen.getByText('Click a tool to put it on the page or take it off.')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    expect(screen.getByText('Debt payoff')).toBeInTheDocument()
  })
  it('toggles a tool off and saves the choice', async () => {
    renderApp(<ToolPicker />)
    await userEvent.click(screen.getByRole('button', { name: /What to show/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Debt payoff/ }))
    expect(JSON.parse(localStorage.getItem('ledger:toolsShown') as string)).not.toContain('debt')
    expect(screen.getByRole('button', { name: /What to show/, hidden: true })).toHaveTextContent('8/9')
  })
  it('Clear all and Show all flip every tool', async () => {
    renderApp(<ToolPicker />)
    await userEvent.click(screen.getByRole('button', { name: /What to show/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(JSON.parse(localStorage.getItem('ledger:toolsShown') as string)).toEqual([])
    await userEvent.click(screen.getByRole('button', { name: 'Show all' }))
    expect(JSON.parse(localStorage.getItem('ledger:toolsShown') as string)).toHaveLength(9)
  })
  it('Done closes the modal', async () => {
    renderApp(<ToolPicker />)
    await userEvent.click(screen.getByRole('button', { name: /What to show/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.queryByText('Click a tool to put it on the page or take it off.')).toBeNull()
  })
  it('adds a list, shows it in the picker and turns it on', async () => {
    renderApp(<ToolPicker />)
    await userEvent.click(screen.getByRole('button', { name: /What to show/ }))
    await userEvent.click(screen.getByRole('button', { name: /Add a list/ }))
    await userEvent.type(screen.getByPlaceholderText('Gift ideas'), 'Gifts')
    await userEvent.click(screen.getByRole('button', { name: 'Add list' }))
    const lists = JSON.parse(localStorage.getItem('ledger:lists') as string)
    expect(lists).toHaveLength(1)
    expect(lists[0].title).toBe('Gifts')
    expect(JSON.parse(localStorage.getItem('ledger:toolsShown') as string)).toContain(lists[0].id)
    expect(screen.getByRole('checkbox', { name: /Gifts/ })).toBeChecked()
  })
  it('a saved selection with fewer tools shows its count', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['cash', 'debt']))
    renderApp(<ToolPicker />)
    expect(screen.getByRole('button', { name: /What to show/ })).toHaveTextContent('2/9')
  })
})
