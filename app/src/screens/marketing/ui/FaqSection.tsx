import { FAQ_ITEMS } from '@/screens/marketing/constants/FAQ_ITEMS'

export function FaqSection() {
  return (
    <section className="faq reveal-kids" id="faq">
      <h2>Questions</h2>
      {FAQ_ITEMS.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  )
}
