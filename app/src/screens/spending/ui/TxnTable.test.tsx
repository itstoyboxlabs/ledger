import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { renderApp } from '@/test-utils/renderApp'
import { TxnTable } from '@/screens/spending/ui/TxnTable'
import type { Transaction } from '@/shared/types/Transaction'

const txns = [
  { id: 'a', date: '2026-05-01', merchant: 'Alpha', desc: 'ALPHA 1', cat: 'Food & Dining', sub: 'Groceries', account: 'cc', kind: 'expense', amount: 30 },
  { id: 'b', date: '2026-05-03', merchant: 'Beta', desc: 'BETA 2', cat: 'Other', sub: 'Misc', account: 'chk', kind: 'expense', amount: 100 },
  { id: 'c', date: '2026-05-02', merchant: 'Gamma', desc: 'REFUND', cat: 'Other', sub: 'Misc', account: 'cc', kind: 'refund', amount: 10 },
] as Transaction[]
const merchants = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[1]?.textContent)

describe('TxnTable', () => {
  beforeEach(() => loadSampleData())

  it('shows title, net total and count', () => {
    renderApp(<TxnTable txns={txns} title="May" />)
    expect(screen.getByText('May')).toBeInTheDocument()
    expect(screen.getByText('$120.00')).toBeInTheDocument()
    expect(screen.getByText('3 transactions')).toBeInTheDocument()
  })
  it('sorts newest first and formats day, account and refund', () => {
    renderApp(<TxnTable txns={txns} title="May" />)
    expect(merchants().map((m) => m.slice(0, 4))).toEqual(['Beta', 'Gamm', 'Alph'])
    expect(screen.getByText('May 3')).toBeInTheDocument()
    expect(screen.getAllByText('Maple Card').length).toBe(2)
    expect(screen.getByText('−$10.00')).toBeInTheDocument()
  })
  it('sorts by amount and toggles direction', async () => {
    renderApp(<TxnTable txns={txns} title="May" />)
    await userEvent.click(screen.getByRole('columnheader', { name: /Amount/ }))
    expect(screen.getByRole('columnheader', { name: /Amount ↓/ })).toBeInTheDocument()
    expect(merchants()[0]).toContain('Beta')
    await userEvent.click(screen.getByRole('columnheader', { name: /Amount/ }))
    expect(screen.getByRole('columnheader', { name: /Amount ↑/ })).toBeInTheDocument()
    expect(merchants()[0]).toContain('Gamma')
  })
  it('handles an empty list', () => {
    renderApp(<TxnTable txns={[]} title="None" />)
    expect(screen.getByText('0 transactions')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })
})
