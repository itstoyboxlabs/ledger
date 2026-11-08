import { render, screen } from '@testing-library/react'
import { AppKpi } from '@/screens/marketing/ui/AppKpi'
import { APP_KPIS } from '@/screens/marketing/constants/APP_KPIS'

describe('AppKpi', () => {
  it('shows the label, value and detail', () => {
    render(<AppKpi kpi={APP_KPIS[0]} />)
    expect(screen.getByText('Spending')).toBeInTheDocument()
    expect(screen.getByText('$6,405.05')).toBeInTheDocument()
    expect(screen.getByText('59 transactions')).toBeInTheDocument()
  })
  it('colors the detail when asked', () => {
    render(<AppKpi kpi={APP_KPIS[2]} />)
    expect(screen.getByText('$88 worse than Sep')).toHaveClass('up')
  })
})
