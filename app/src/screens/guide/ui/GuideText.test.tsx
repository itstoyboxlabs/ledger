import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuideText } from './GuideText'

const setup = () => {
  const goTo = vi.fn()
  const onAnchor = vi.fn()
  render(
    <p>
      <GuideText
        goTo={goTo}
        onAnchor={onAnchor}
        parts={['Open ', { tab: 'budget', text: 'Budget' }, ', click ', { label: 'Add row' }, ', run ', { code: 'npm run dev' }, ', read ', { anchor: 'step-2', text: 'step 2' }, ' or ', { href: 'https://example.com', text: 'the docs' }, '.']}
      />
    </p>,
  )
  return { goTo, onAnchor }
}

describe('GuideText', () => {
  it('renders plain words, bold labels and code', () => {
    setup()
    expect(screen.getByText('Add row').tagName).toBe('STRONG')
    expect(screen.getByText('npm run dev').tagName).toBe('CODE')
    expect(screen.getByText(/Open/)).toBeInTheDocument()
  })

  it('switches tabs from a tab link', async () => {
    const { goTo } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Budget' }))
    expect(goTo).toHaveBeenCalledWith('budget')
  })

  it('scrolls to a heading from an anchor link', async () => {
    const { onAnchor } = setup()
    const link = screen.getByRole('link', { name: 'step 2' })
    expect(link).toHaveAttribute('href', '#step-2')
    await userEvent.click(link)
    expect(onAnchor).toHaveBeenCalledWith('step-2')
  })

  it('opens outside links in a new tab without a referrer', () => {
    setup()
    const link = screen.getByRole('link', { name: /the docs/ })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link).toHaveTextContent('(opens in a new tab)')
  })
})
