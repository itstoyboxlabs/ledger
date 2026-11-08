type PreviewTabsProps = { items: string[]; className?: string }

// A row of labels where the first looks selected. Only for show, like the rest of the app preview.
export function PreviewTabs({ items, className }: PreviewTabsProps) {
  return (
    <div className={className}>
      {items.map((label, i) => (
        <span key={label} className={i === 0 ? 'on' : undefined}>
          {label}
        </span>
      ))}
    </div>
  )
}
