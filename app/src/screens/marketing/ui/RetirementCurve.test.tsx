import { render, screen } from '@testing-library/react'
import { RetirementCurve } from '@/screens/marketing/ui/RetirementCurve'

describe('RetirementCurve', () => {
  it('labels the retirement marker and the ages', () => {
    const points = [{ age: 34, value: 0 }, { age: 60, value: 3000000 }]
    render(<RetirementCurve points={points} markAge={55} markValue={2000000} markLabel="Retire at 55" markValueLabel="$2M" />)
    expect(screen.getByText('Retire at 55')).toBeInTheDocument()
    expect(screen.getByText('$2M')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })
})
