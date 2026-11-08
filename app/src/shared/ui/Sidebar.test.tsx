import type { ComponentProps } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { Sidebar } from './Sidebar'
import { NAV } from '@/shared/constants/NAV'
import { loadSampleData } from '@/test-utils/loadSampleData'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
})
beforeEach(() => loadSampleData())

const setup = (props: Partial<ComponentProps<typeof Sidebar>> = {}) => {
  const fns = { setView: vi.fn(), setAccounts: vi.fn(), onNotes: vi.fn(), onExport: vi.fn(), onCsv: vi.fn() }
  render(<TooltipProvider><Sidebar view="actuals" accounts={['chk']} {...fns} {...props} /></TooltipProvider>)
  return fns
}
const desktop = () => within(document.querySelector('aside') as HTMLElement)

describe('Sidebar', () => {
  it('lists every nav page', () => {
    setup()
    for (const [, label] of NAV) expect(desktop().getByRole('button', { name: label })).toBeInTheDocument()
  })

  it('navigates when a page is clicked', async () => {
    const { setView } = setup()
    await userEvent.click(desktop().getByRole('button', { name: 'Budget' }))
    expect(setView).toHaveBeenCalledWith('budget')
  })

  it('groups accounts under their bank with last four digits', () => {
    setup()
    expect(desktop().getByText('Harbor Bank')).toBeInTheDocument()
    expect(desktop().getByText(/Checking/)).toHaveTextContent('••4821')
  })

  it('marks accounts on and off', () => {
    setup({ accounts: ['chk'] })
    const [chk, cc] = [/Checking/, /Maple Card/].map((n) => desktop().getByRole('button', { name: n }))
    expect(chk).toHaveAttribute('aria-pressed', 'true')
    expect(cc).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggling an account updates the filter and goes to Spending', async () => {
    const { setAccounts, setView } = setup({ view: 'budget', accounts: ['chk'] })
    await userEvent.click(desktop().getByRole('button', { name: /Maple Card/ }))
    expect(setAccounts).toHaveBeenCalledWith(['chk', 'cc'])
    expect(setView).toHaveBeenCalledWith('actuals')
    await userEvent.click(desktop().getByRole('button', { name: /Checking/ }))
    expect(setAccounts).toHaveBeenLastCalledWith([])
  })

  it('fires the notes, export and csv actions', async () => {
    const { onNotes, onExport, onCsv } = setup()
    await userEvent.click(desktop().getByRole('button', { name: 'Notes' }))
    await userEvent.click(desktop().getByRole('button', { name: 'Export data' }))
    await userEvent.click(desktop().getByRole('button', { name: 'Download' }))
    expect(onNotes).toHaveBeenCalled()
    expect(onExport).toHaveBeenCalled()
    expect(onCsv).toHaveBeenCalled()
  })

  it('says Export data saves one ledger-data.json file', async () => {
    setup({ onUpload: vi.fn() })
    await userEvent.hover(desktop().getByRole('button', { name: 'Export data' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('save everything to one ledger-data.json file')
  })

  it('says Upload file takes your ledger-data.json and replaces what is stored', async () => {
    setup({ onUpload: vi.fn() })
    await userEvent.hover(desktop().getByRole('button', { name: 'Upload file' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('pick your ledger-data.json. It replaces what is stored on this device.')
  })

  it('shows the upload button only when onUpload is given', async () => {
    setup()
    expect(desktop().queryByRole('button', { name: 'Upload file' })).toBeNull()
  })

  it('calls onUpload when provided', async () => {
    const onUpload = vi.fn()
    setup({ onUpload })
    await userEvent.click(desktop().getByRole('button', { name: 'Upload file' }))
    expect(onUpload).toHaveBeenCalled()
  })

  it('opens the phone menu drawer', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
