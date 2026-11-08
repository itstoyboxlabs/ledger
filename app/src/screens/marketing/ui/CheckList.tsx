import { Icon } from '@/screens/marketing/ui/Icon'
import type { CheckItem } from '@/screens/marketing/types/CheckItem'

type CheckListProps = { items: CheckItem[] }

// A list with a check mark on each line. An item is text, or { bold, rest } to bold the start.
export function CheckList({ items }: CheckListProps) {
  return (
    <ul className="checks">
      {items.map((item) =>
        typeof item === 'string' ? (
          <li key={item}>
            <Icon name="check" />
            {item}
          </li>
        ) : (
          <li key={item.bold}>
            <Icon name="check" />
            <span>
              <b>{item.bold}</b>
              {item.rest}
            </span>
          </li>
        ),
      )}
    </ul>
  )
}
