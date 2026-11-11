import { STATEMENT } from '@/screens/marketing/constants/STATEMENT'

export function Statement() {
  return (
    <section className="statement reveal">
      <p>
        <span>{STATEMENT.lead}</span> {STATEMENT.rest}
      </p>
    </section>
  )
}
