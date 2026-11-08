// Scrolls to an element on a page that mounts on a later render: polls briefly (20 tries, 50ms
// apart) until the element exists, then scrolls it to the top. Gives up quietly if it never shows.
export function scrollToWhenReady(id: string): void {
  let tries = 0
  const t = setInterval(() => {
    const el = document.getElementById(id)
    if (el || ++tries > 20) {
      clearInterval(t)
      el?.scrollIntoView({ block: 'start' })
    }
  }, 50)
}
