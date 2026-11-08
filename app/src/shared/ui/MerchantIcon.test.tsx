import { render, screen } from '@testing-library/react'
import { MerchantIcon } from './MerchantIcon'
import { loadSampleData } from '@/test-utils/loadSampleData'

beforeEach(() => loadSampleData())

describe('MerchantIcon', () => {
  it('falls back to the first letter for an unknown merchant', async () => {
    render(<MerchantIcon name="Zebra Shop" />)
    expect(await screen.findByText('Z')).toBeInTheDocument()
  })

  it('skips a leading "The " for the letter', async () => {
    render(<MerchantIcon name="The Corner Cafe" />)
    expect(await screen.findByText('C')).toBeInTheDocument()
  })

  it('applies the size', () => {
    const { container } = render(<MerchantIcon name="Zebra" size={30} />)
    expect(container.firstChild).toHaveStyle({ width: '30px', height: '30px' })
  })

  it('uses square corners at small sizes and round at large', () => {
    const small = render(<MerchantIcon name="Zebra" size={18} />)
    expect((small.container.firstChild as HTMLElement).className).toMatch(/rounded-\[5px\]/)
    const big = render(<MerchantIcon name="Zebra" size={30} />)
    expect((big.container.firstChild as HTMLElement).className).not.toMatch(/rounded-\[5px\]/)
  })
})
