import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className, style }: { children: React.ReactNode; to: string; className?: string; style?: React.CSSProperties }) => (
    <a href={to} className={className} style={style}>{children}</a>
  ),
}))

import { ClubCard } from './ClubCard'

describe('ClubCard', () => {
  it('renders label text', () => {
    render(<ClubCard label="Digital Directory" to="/directory" bgColor="#372616" />)
    expect(screen.getByText('Digital Directory')).toBeInTheDocument()
  })
  it('renders as internal Link when to is provided', () => {
    render(<ClubCard label="Digital Directory" to="/directory" bgColor="#372616" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/directory')
  })
  it('renders as external anchor when href is provided', () => {
    render(<ClubCard label="External Site" href="https://example.com" bgColor="#2F4366" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  })
  it('applies background color as inline style', () => {
    render(<ClubCard label="Test" to="/test" bgColor="#372616" />)
    const link = screen.getByRole('link')
    expect(link.style.backgroundColor).toBe('rgb(55, 38, 22)')
  })
})
