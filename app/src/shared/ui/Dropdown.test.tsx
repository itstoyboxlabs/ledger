import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown } from './Dropdown'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
})
const OPTIONS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]

describe('Dropdown', () => {
  it('shows the label and selected option', () => {
    render(<Dropdown label="Month" options={OPTIONS} value="b" onChange={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('MonthBeta')
  })

  it('hides the label when hideLabel is set', () => {
    render(<Dropdown label="Month" options={OPTIONS} value="b" onChange={() => {}} hideLabel />)
    expect(screen.getByRole('button')).not.toHaveTextContent('Month')
  })

  it('single select calls onChange with the value', async () => {
    const onChange = vi.fn()
    render(<Dropdown label="Month" options={OPTIONS} value="a" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Gamma' }))
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('multi select summarizes the selection', () => {
    const { rerender } = render(<Dropdown label="Category" options={OPTIONS} values={['a', 'c']} onToggle={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('Alpha, Gamma')
    rerender(<Dropdown label="Category" options={OPTIONS} values={[]} onToggle={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('No category')
    rerender(<Dropdown label="Category" options={OPTIONS} values={['a', 'b', 'c']} onToggle={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('All categorys')
  })

  it('multi select toggles without closing', async () => {
    const onToggle = vi.fn()
    render(<Dropdown label="Category" options={OPTIONS} values={['a']} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Beta' }))
    expect(onToggle).toHaveBeenCalledWith('b')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Alpha' })).toBeInTheDocument()
  })
})
