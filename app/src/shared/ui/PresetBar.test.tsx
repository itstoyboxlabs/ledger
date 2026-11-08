import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { PresetBar } from './PresetBar'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
})
beforeEach(() => localStorage.clear())

const PRESETS = [{ name: 'Lean', data: { v: 1 } }, { name: 'Loose', data: { v: 2 } }]
const setup = (props = {}) => {
  const fns = { onApply: vi.fn(), onSave: vi.fn(), onDelete: vi.fn() }
  render(<TooltipProvider><PresetBar presets={PRESETS} currentData={{ v: 0 }} {...fns} {...props} /></TooltipProvider>)
  return fns
}

describe('PresetBar', () => {
  it('shows "Presets" when none is active', () => {
    setup()
    expect(screen.getByRole('button', { name: /Presets/ })).toBeInTheDocument()
  })

  it('shows the preset whose data matches the current values', () => {
    setup({ currentData: { v: 2 } })
    expect(screen.getByRole('button', { name: /Loose/ })).toBeInTheDocument()
    expect(screen.queryByLabelText('Changed since this preset')).toBeNull()
  })

  it('applies a preset and remembers it as active', async () => {
    const { onApply } = setup()
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Lean' }))
    expect(onApply).toHaveBeenCalledWith({ v: 1 })
    expect(localStorage.getItem('ledger:presetActive:default')).toBe('"Lean"')
  })

  it('shows the drift dot when values moved away from the last applied preset', () => {
    localStorage.setItem('ledger:presetActive:default', '"Lean"')
    setup({ currentData: { v: 99 } })
    expect(screen.getByLabelText('Changed since this preset')).toBeInTheDocument()
  })

  it('saves a new named preset', async () => {
    const { onSave } = setup()
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /Save as new preset/ }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    await userEvent.type(screen.getByPlaceholderText('Preset name'), '  Tight  {Enter}')
    expect(onSave).toHaveBeenCalledWith('Tight')
  })

  it('offers Replace when the name matches an existing preset', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /Save as new preset/ }))
    await userEvent.click(screen.getByTitle('Fill in "Lean" so Save overwrites it'))
    expect(screen.getByRole('button', { name: 'Replace' })).toBeEnabled()
  })

  it('confirms before deleting', async () => {
    const { onDelete } = setup()
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    await userEvent.click(await screen.findByLabelText('Delete preset "Lean"'))
    expect(await screen.findByText('Delete preset?')).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('Lean')
  })

  it('shows a hint at the top of the menu when given', async () => {
    setup({ hint: 'On Retirement you pick one for each period by age.' })
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    expect(await screen.findByText('On Retirement you pick one for each period by age.')).toBeInTheDocument()
  })

  it('says so when there are no presets', async () => {
    setup({ presets: [] })
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    expect(await screen.findByText('No presets yet')).toBeInTheDocument()
  })

  it('has no rename button unless it can rename', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Presets/ }))
    await screen.findByRole('menuitem', { name: 'Lean' })
    expect(screen.queryByRole('button', { name: 'Rename preset "Lean"' })).toBeNull()
  })

  it('renames a preset and keeps it active', async () => {
    localStorage.setItem('ledger:presetActive:default', '"Lean"')
    const onRename = vi.fn()
    setup({ onRename })
    await userEvent.click(screen.getByRole('button', { name: /Lean/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'Rename preset "Lean"' }))
    const input = screen.getByLabelText('New preset name')
    await userEvent.clear(input)
    await userEvent.type(input, 'Loose')
    expect(screen.getByText('Another preset has that name.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled()
    await userEvent.clear(input)
    await userEvent.type(input, 'Thin{Enter}')
    expect(onRename).toHaveBeenCalledWith('Lean', 'Thin')
    expect(localStorage.getItem('ledger:presetActive:default')).toBe('"Thin"')
  })
})
