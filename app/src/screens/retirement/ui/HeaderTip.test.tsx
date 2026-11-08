import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'
import { HeaderTip } from './HeaderTip'

describe('HeaderTip', () => {
  it('shows the label with an info icon', () => {
    const { container } = renderApp(<HeaderTip label="Growth" tip="help" />)
    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('right-aligns when asked', () => {
    const { container } = renderApp(<HeaderTip label="Growth" tip="help" right />)
    expect((container.firstChild as HTMLElement).className).toContain('justify-end')
  })
  it('does not right-align by default', () => {
    const { container } = renderApp(<HeaderTip label="Growth" tip="help" />)
    expect((container.firstChild as HTMLElement).className).not.toContain('justify-end')
  })
})
