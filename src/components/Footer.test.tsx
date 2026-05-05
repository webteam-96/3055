import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders copyright text with Kaizen Infotech', () => {
    render(<Footer />)
    expect(screen.getByText(/Kaizen Infotech/i)).toBeInTheDocument()
  })
  it('renders at least 3 logo images', () => {
    render(<Footer />)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThanOrEqual(3)
  })
  it('has link to kaizeninfotech.com', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /Kaizen Infotech/i })
    expect(link).toHaveAttribute('href', 'https://kaizeninfotech.com/')
  })
})
