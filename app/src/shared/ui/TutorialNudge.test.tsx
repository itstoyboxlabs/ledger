import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { persistedStore } from '@/shared/state/persistedStore'
import { TutorialNudge } from './TutorialNudge'
import { TUTORIAL_URL } from '@/shared/constants/TUTORIAL_URL'

vi.mock('@/shared/utils/isLocal', () => ({ isLocal: vi.fn(() => false) }))
import { isLocal } from '@/shared/utils/isLocal'

beforeEach(() => {
  localStorage.clear()
  persistedStore.setState({ entries: {} })
  vi.mocked(isLocal).mockReturnValue(false)
})
const setup = () => render(<TutorialNudge><a href="https://example.test/t" onClick={(e) => e.preventDefault()}>Tutorial</a></TutorialNudge>)

describe('TutorialNudge', () => {
  it('shows the callout on first use', () => {
    setup()
    expect(screen.getByRole('dialog', { name: 'Watch the tutorials first' })).toHaveTextContent(/recommend watching the short tutorial videos/)
    expect(screen.getByRole('button', { name: 'Okay' })).toBeInTheDocument()
  })

  it('Okay saves the flag and removes the callout', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Okay' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(localStorage.getItem('ledger:tutorialAck')).toBe('true')
  })

  it('clicking the wrapped link counts as acknowledging', async () => {
    setup()
    await userEvent.click(screen.getByRole('link', { name: 'Tutorial' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(localStorage.getItem('ledger:tutorialAck')).toBe('true')
  })

  it('"Open the tutorials" points at the tutorial and acknowledges', async () => {
    setup()
    const link = screen.getByRole('link', { name: 'Open the tutorials' })
    expect(link).toHaveAttribute('href', TUTORIAL_URL)
    link.addEventListener('click', (e) => e.preventDefault())
    await userEvent.click(link)
    expect(localStorage.getItem('ledger:tutorialAck')).toBe('true')
  })

  it('Escape hides it without saving the flag', async () => {
    setup()
    screen.getByRole('button', { name: 'Okay' }).focus()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(localStorage.getItem('ledger:tutorialAck')).not.toBe('true')
  })

  it('stays away once acknowledged and in local mode', () => {
    localStorage.setItem('ledger:tutorialAck', 'true')
    setup()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('link', { name: 'Tutorial' })).toBeInTheDocument()
  })

  it('does not show in local mode', () => {
    vi.mocked(isLocal).mockReturnValue(true)
    setup()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
