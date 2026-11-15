import { render, screen } from '@testing-library/react'
import { ToolVideoModal } from './ToolVideoModal'

describe('ToolVideoModal', () => {
  it('says the video is coming soon for a tool without one', () => {
    render(<ToolVideoModal id="nope" title="Some tool" onClose={() => {}} />)
    expect(screen.getByText('Some tool')).toBeInTheDocument()
    expect(screen.getByText('The video for this tool is coming soon.')).toBeInTheDocument()
  })
})
