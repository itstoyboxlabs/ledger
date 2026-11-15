import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolHeading } from './ToolHeading'

describe('ToolHeading', () => {
  it('shows the title and keeps the description out of sight until the info button is used', async () => {
    render(<ToolHeading id="cash" title="Cash tool">What it does</ToolHeading>)
    expect(screen.getByRole('heading', { name: 'Cash tool' })).toBeInTheDocument()
    expect(screen.queryByText('What it does')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'About Cash tool' }))
    expect(await screen.findByText('What it does')).toBeInTheDocument()
  })
  it('opens the video window from the video button', async () => {
    render(<ToolHeading id="cash" title="Cash tool">What it does</ToolHeading>)
    await userEvent.click(screen.getByRole('button', { name: 'Watch the Cash tool video' }))
    expect(await screen.findByText('The video for this tool is coming soon.')).toBeInTheDocument()
  })
  it('shows the action at the right', () => {
    render(<ToolHeading id="cash" title="Cash tool" action={<button>Swap</button>}>x</ToolHeading>)
    expect(screen.getByRole('button', { name: 'Swap' })).toBeInTheDocument()
  })
})
