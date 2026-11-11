import { FAQ_ITEMS } from '@/screens/marketing/constants/FAQ_ITEMS'

export function FaqSection() {
  return (
    <section className="faq" id="faq">
      <h2 className="reveal">Questions</h2>
      <div className="reveal-kids">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
