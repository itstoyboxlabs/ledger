import { renderHook, waitFor } from '@testing-library/react'
import { useDebtLinkMigration } from './useDebtLinkMigration'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(async () => {
  await seedStorage({ budget: { rows: [{ id: 'row-1', name: 'Car loan' }] } })
  localStorage.clear()
})
const saved = () => JSON.parse(localStorage.getItem('ledger:debts') ?? 'null')

describe('useDebtLinkMigration', () => {
  it('replaces linkName with the budget row id', async () => {
    localStorage.setItem('ledger:debts', JSON.stringify([{ id: 'd1', name: 'Car', balance: 1, linkName: 'Car loan' }]))
    renderHook(() => useDebtLinkMigration())
    await waitFor(() => expect(saved()[0].budgetRow).toBe('row-1'))
    expect(saved()[0]).not.toHaveProperty('linkName')
  })

  it('sets budgetRow to null when no row has that name', async () => {
    localStorage.setItem('ledger:debts', JSON.stringify([{ id: 'd1', name: 'Car', balance: 1, linkName: 'Missing' }]))
    renderHook(() => useDebtLinkMigration())
    await waitFor(() => expect(saved()[0]).not.toHaveProperty('linkName'))
    expect(saved()[0].budgetRow).toBeNull()
  })

  it('leaves debts without a linkName alone', async () => {
    localStorage.setItem('ledger:debts', JSON.stringify([{ id: 'd1', name: 'Card', balance: 1, budgetRow: 'x' }]))
    renderHook(() => useDebtLinkMigration())
    await new Promise((r) => setTimeout(r, 20))
    expect(saved()[0].budgetRow).toBe('x')
  })
})
