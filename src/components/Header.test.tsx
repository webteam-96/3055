import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className, ...props }: { children: React.ReactNode; to: string; className?: string; [key: string]: unknown }) => (
    <a href={to} className={className} {...props}>{children}</a>
  ),
  useRouterState: () => ({ location: { pathname: '/' } }),
}))

import { Header } from './Header'

describe('Header', () => {
  it('renders HOME nav link', () => {
    render(<Header />)
    expect(screen.getByText('HOME')).toBeInTheDocument()
  })
  it('renders DIGITAL DIRECTORY nav link', () => {
    render(<Header />)
    expect(screen.getByText('DIGITAL DIRECTORY')).toBeInTheDocument()
  })
  it('renders logo images', () => {
    render(<Header />)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThanOrEqual(1)
  })
  it('renders hamburger button for mobile', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
  })
  it('opens mobile menu when hamburger clicked', () => {
    render(<Header />)
    const btn = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })
})
