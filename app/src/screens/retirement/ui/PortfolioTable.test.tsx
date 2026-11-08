import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { PortfolioTable } from './PortfolioTable'

const rows = [
  { name: 'Stocks', alloc: 60, perf: 8 },
  { name: 'Bonds', alloc: 40, perf: 3 },
]

describe('PortfolioTable', () => {
  it('renders a row per fund and the weighted return', () => {
    renderApp(<PortfolioTable heading="While working" rows={rows} setRows={() => {}} />)
    expect(screen.getByText('While working')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Stocks')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bonds')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('6.00%')).toBeInTheDocument()
  })
  it('shows 0.00% when nothing is allocated', () => {
    renderApp(<PortfolioTable heading="H" rows={[{ name: 'A', alloc: 0, perf: 5 }]} setRows={() => {}} />)
    expect(screen.getByText('0.00%', { selector: 'td' })).toBeInTheDocument()
  })
  it('adds a fund', async () => {
    const setRows = vi.fn()
    renderApp(<PortfolioTable heading="H" rows={rows} setRows={setRows} />)
    await userEvent.click(screen.getByRole('button', { name: '+ Add fund' }))
    expect(setRows).toHaveBeenCalledWith([...rows, { name: '', alloc: 0, perf: 0 }])
  })
  it('removes a fund', async () => {
    const setRows = vi.fn()
    renderApp(<PortfolioTable heading="H" rows={rows} setRows={setRows} />)
    const row = screen.getByDisplayValue('Stocks').closest('tr') as HTMLElement
    await userEvent.click(within(row).getAllByRole('button').at(-1) as HTMLElement)
    expect(setRows).toHaveBeenCalledWith([rows[1]])
  })
  it('renames a fund', async () => {
    const setRows = vi.fn()
    renderApp(<PortfolioTable heading="H" rows={[rows[0]]} setRows={setRows} />)
    await userEvent.type(screen.getByDisplayValue('Stocks'), 'X')
    expect(setRows).toHaveBeenLastCalledWith([{ ...rows[0], name: 'StocksX' }])
  })
  it('renders the action slot', () => {
    renderApp(<PortfolioTable heading="H" rows={rows} setRows={() => {}} action={<button>Go</button>} />)
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })
})
