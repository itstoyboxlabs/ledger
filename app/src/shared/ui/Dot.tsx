type DotProps = { color: string }

export function Dot({ color }: DotProps) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
      style={{ background: color }}
    />
  )
}
