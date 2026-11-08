import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { getMonths } from '@/shared/utils/getMonths'
import { monthCompareLabel } from '@/shared/utils/monthCompareLabel'
import { CompareMonthDropdown } from './CompareMonthDropdown'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  Element.prototype.scrollIntoView ??= () => {}
})
beforeEach(() => loadSampleData())

describe('CompareMonthDropdown', () => {
  it('shows the picked month', () => {
    const m = getMonths()[0]
    renderApp(<CompareMonthDropdown value={m} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /Month/ })).toHaveTextContent(monthCompareLabel(m))
  })

  it('lists every month newest first and reports the pick', async () => {
    const months = getMonths()
    const onChange = vi.fn()
    renderApp(<CompareMonthDropdown value={months[0]} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Month/ }))
    const items = await screen.findAllByRole('menuitem')
    expect(items).toHaveLength(months.length)
    expect(items[0]).toHaveTextContent(monthCompareLabel(months.at(-1) ?? ''))
    await userEvent.click(items[0])
    expect(onChange).toHaveBeenCalledWith(months.at(-1))
  })
})
