import type { KeyValueTone } from '@/screens/marketing/types/KeyValueTone'
type KeyValueRowProps = { label: string; amount: string; tone?: KeyValueTone }

// A label on the left and an amount on the right, with a line above. `tone` is 'neg' or 'pos'.
export function KeyValueRow({ label, amount, tone }: KeyValueRowProps) {
  return (
    <div className="kv">
      <span>{label}</span>
      <b className={tone}>{amount}</b>
    </div>
  )
}
