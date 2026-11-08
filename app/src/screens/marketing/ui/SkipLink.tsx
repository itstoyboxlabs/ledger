// First stop when you press Tab: jumps over the nav to the page content. Hidden until it has focus.
export function SkipLink() {
  return (
    <a className="skip" href="#main">
      Skip to content
    </a>
  )
}
