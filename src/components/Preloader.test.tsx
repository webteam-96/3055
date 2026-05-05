import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Preloader } from './Preloader'

describe('Preloader', () => {
  it('renders when isLoading is true', () => {
    const { container } = render(<Preloader isLoading={true} />)
    expect(container.querySelector('.preloader')).toBeInTheDocument()
  })
  it('renders nothing when isLoading is false', () => {
    const { container } = render(<Preloader isLoading={false} />)
    expect(container.querySelector('.preloader')).not.toBeInTheDocument()
  })
})
