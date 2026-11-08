import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { renderApp } from '@/test-utils/renderApp'
import { getSubscriptions } from '@/shared/utils/getSubscriptions'
import { monthlyCost } from '@/shared/utils/monthlyCost'
import { isActiveSubscription } from '@/shared/utils/isActiveSubscription'
import { fmt } from '@/shared/utils/fmt'
import { SubscriptionsTable } from '@/screens/spending/ui/SubscriptionsTable'

const names = () => screen.getAllByRole('row').slice(1, -1).map((r) => within(r).getAllByRole('cell')[0].textContent.trim())

describe('SubscriptionsTable', () => {
  beforeEach(() => {
    localStorage.clear()
    loadSampleData()
  })

  it('lists active subscriptions with the monthly total', () => {
    renderApp(<SubscriptionsTable />)
    const active = getSubscriptions().filter(isActiveSubscription)
    const total = active.reduce((s, x) => s + monthlyCost(x), 0)
    expect(names()).toHaveLength(active.length)
    expect(screen.getByText('Estimated monthly total').closest('tr')).toHaveTextContent(fmt(total))
    expect(screen.getByText(`${active.length} active · ≈${fmt(total)}/month`)).toBeInTheDocument()
  })
  it('defaults to most expensive per month first', () => {
    renderApp(<SubscriptionsTable />)
    const costs = getSubscriptions().filter(isActiveSubscription).sort((a, b) => monthlyCost(b) - monthlyCost(a)).map((s) => s.name)
    expect(names()).toEqual(costs)
  })
  it('sorts by service name and persists the choice', async () => {
    renderApp(<SubscriptionsTable />)
    await userEvent.click(screen.getByRole('columnheader', { name: /Service/ }))
    const sorted = [...names()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    expect(names()).toEqual(sorted)
    expect(JSON.parse(localStorage.getItem('ledger:subsSort2') as string)).toEqual({ key: 'name', dir: 'asc' })
    expect(screen.getByRole('columnheader', { name: /Service/ })).toHaveAttribute('aria-sort', 'ascending')
  })
  it('restores a saved sort and ignores an invalid one', () => {
    localStorage.setItem('ledger:subsSort2', JSON.stringify({ key: 'bogus', dir: 'asc' }))
    renderApp(<SubscriptionsTable />)
    expect(screen.getByRole('columnheader', { name: /≈ \/ month/ })).toHaveAttribute('aria-sort', 'descending')
  })
  it('toggles the list of inactive subscriptions', async () => {
    renderApp(<SubscriptionsTable />)
    const inactive = getSubscriptions().filter((s) => !isActiveSubscription(s))
    const btn = screen.queryByRole('button', { name: /not seen recently/ })
    if (!inactive.length) return expect(btn).toBeNull()
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(btn as HTMLElement)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(inactive.map((s) => s.name).join(', '))).toBeInTheDocument()
  })
})
