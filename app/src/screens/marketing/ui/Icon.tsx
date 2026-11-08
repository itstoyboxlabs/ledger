import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name?: string
  paths?: string[]
}

// An inline SVG icon. Pass `name` for a symbol from IconSprite, `paths` for a list of path strings
// or `children` for any other shapes (24 x 24 grid).
export function Icon({ name, paths, children, className = 'i', ...rest }: IconProps) {
  if (name) {
    return (
      <svg className={className} aria-hidden="true" {...rest}>
        <use href={`#${name}`} />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {paths ? paths.map((d) => <path key={d} d={d} />) : children}
    </svg>
  )
}
