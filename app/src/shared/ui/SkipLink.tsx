// First stop when you press Tab: jumps over the sidebar to the page content. Hidden until it has focus.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[var(--surface-3)] focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-white focus:ring-2 focus:ring-[var(--accent)]"
    >
      Skip to content
    </a>
  )
}
