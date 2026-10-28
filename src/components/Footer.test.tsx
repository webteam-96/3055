import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders copyright text with Kaizen Infotech', () => {
    render(<Footer />)
    expect(screen.getByText(/Kaizen Infotech/i)).toBeInTheDocument()
  })
  it('renders no logos — copyright only', () => {
    render(<Footer />)
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })
  it('has link to kaizeninfotech.com', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /Kaizen Infotech/i })
    expect(link).toHaveAttribute('href', 'https://kaizeninfotech.com/')
  })
})
