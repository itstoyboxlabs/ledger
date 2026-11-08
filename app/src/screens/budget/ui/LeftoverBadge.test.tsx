import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { LeftoverBadge } from './LeftoverBadge'

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

describe('LeftoverBadge', () => {
  afterEach(() => { document.body.innerHTML = '' })
  it('renders a labelled button', () => {
    renderApp(<LeftoverBadge />)
    expect(screen.getByRole('button', { name: 'What happens to this money' })).toBeInTheDocument()
  })
  it('scrolls to the leftover plan when clicked', async () => {
    const target = document.createElement('div')
    target.id = 'leftover-plan'
    target.scrollIntoView = vi.fn()
    document.body.appendChild(target)
    renderApp(<LeftoverBadge />)
    await userEvent.click(screen.getByRole('button', { name: 'What happens to this money' }))
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
  })
  it('does not throw when the plan is not on the page', async () => {
    renderApp(<LeftoverBadge />)
    await userEvent.click(screen.getByRole('button', { name: 'What happens to this money' }))
  })
})
