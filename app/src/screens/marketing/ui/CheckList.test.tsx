import { render, screen } from '@testing-library/react'
import { CheckList } from '@/screens/marketing/ui/CheckList'

describe('CheckList', () => {
  it('lists plain and bold-start items', () => {
    render(<CheckList items={['One', { bold: 'Two', rest: ' and more' }]} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Two').tagName).toBe('B')
    expect(screen.getByText('One')).toBeInTheDocument()
  })
})
