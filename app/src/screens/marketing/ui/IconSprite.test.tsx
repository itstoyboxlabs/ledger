import { render } from '@testing-library/react'
import { IconSprite } from '@/screens/marketing/ui/IconSprite'

describe('IconSprite', () => {
  it('defines the check and github symbols', () => {
    const { container } = render(<IconSprite />)
    expect(container.querySelector('symbol#check')).toBeTruthy()
    expect(container.querySelector('symbol#github')).toBeTruthy()
  })
})
