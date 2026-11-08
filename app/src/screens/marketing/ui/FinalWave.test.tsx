import { render } from '@testing-library/react'
import { FinalWave } from '@/screens/marketing/ui/FinalWave'

describe('FinalWave', () => {
  it('draws the wave', () => {
    const { container } = render(<FinalWave />)
    expect(container.querySelectorAll('path')).toHaveLength(3)
  })
})
