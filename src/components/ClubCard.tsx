import { Link } from '@tanstack/react-router'

interface ClubCardProps {
  label: string
  bgColor: string
  to?: string
  href?: string
}

export function ClubCard({ label, bgColor, to, href }: ClubCardProps) {
  const className = 'avenu-crd'
  const style = { backgroundColor: bgColor }
  const content = <span className="text-white font-semibold text-lg">{label}</span>

  if (to) {
    return (
      <Link to={to} className={className} style={style}>
        {content}
      </Link>
    )
  }
  return (
    <a
      href={href ?? '#'}
      className={className}
      style={style}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
    >
      {content}
    </a>
  )
}
