import { render, screen } from '@testing-library/react'
import { ToolVideoModal } from './ToolVideoModal'

describe('ToolVideoModal', () => {
  it('plays the video for a tool that has one', () => {
    render(<ToolVideoModal id="cash" title="Cash tool" onClose={() => {}} />)
    const video = document.querySelector('video')
    expect(video?.getAttribute('src')).toContain('tool-cash.mp4')
    expect(video?.getAttribute('poster')).toContain('tool-cash.jpg')
  })
  it('says the video is coming soon for a tool without one', () => {
    render(<ToolVideoModal id="nope" title="Some tool" onClose={() => {}} />)
    expect(screen.getByText('Some tool')).toBeInTheDocument()
    expect(screen.getByText('The video for this tool is coming soon.')).toBeInTheDocument()
  })
})
