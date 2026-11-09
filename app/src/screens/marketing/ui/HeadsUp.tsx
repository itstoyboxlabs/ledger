import { HEADS_UP } from '@/screens/marketing/constants/HEADS_UP'

// A plain note near the top that says how importing works, so nobody is surprised that an assistant reads the statements.
export function HeadsUp() {
  return (
    <aside className="heads-up" aria-labelledby="heads-up-title">
      <h2 id="heads-up-title">{HEADS_UP.title}</h2>
      <p>{HEADS_UP.text}</p>
      <p className="closing">{HEADS_UP.closing}</p>
    </aside>
  )
}
