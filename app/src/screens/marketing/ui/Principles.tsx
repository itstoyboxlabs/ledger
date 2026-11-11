import { PRINCIPLES } from '@/screens/marketing/constants/PRINCIPLES'

export function Principles() {
  return (
    <section className="principles reveal-kids" id="open-source">
      {PRINCIPLES.map((p, i) => (
        <div key={p.title}>
          <small>{String(i + 1).padStart(2, '0')}</small>
          <h3>{p.title}</h3>
          <p>{p.text}</p>
        </div>
      ))}
    </section>
  )
}
