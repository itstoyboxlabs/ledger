import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'
import { FieldGroup } from './FieldGroup'

describe('FieldGroup', () => {
  it('renders the label and children', () => {
    renderApp(<FieldGroup label="Timeline"><span>child one</span></FieldGroup>)
    expect(screen.getByRole('heading', { level: 2, name: 'Timeline' })).toBeInTheDocument()
    expect(screen.getByText('child one')).toBeInTheDocument()
  })
  it('renders the action and tip when given', () => {
    const { container } = renderApp(
      <FieldGroup label="Timeline" tip="Some help" action={<button>Reset</button>}>x</FieldGroup>,
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })
  it('applies a custom grid class', () => {
    const { container } = renderApp(<FieldGroup label="L" gridClass="grid-cols-2">x</FieldGroup>)
    expect(container.querySelector('.grid-cols-2')).not.toBeNull()
  })
})
