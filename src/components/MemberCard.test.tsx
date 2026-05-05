import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemberCard } from './MemberCard'

const baseProps = {
  designation: 'District Governor',
  name: 'John Doe',
  club: 'Rotary Club Test',
  mobile: '9999999999',
  email: 'john@test.com',
  dob: '15/03',
  doa: '20/06',
  address: '123 Test Street, Test City',
  photo: '',
  headerColor: '#E8D8CE',
  bodyColor: '#372616',
}

describe('MemberCard', () => {
  it('renders the designation as card header text', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText('District Governor')).toBeInTheDocument()
  })
  it('renders the name', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })
  it('renders the club name', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText(/Rotary Club Test/)).toBeInTheDocument()
  })
  it('renders a profile image', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
  it('renders mobile number', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText(/9999999999/)).toBeInTheDocument()
  })
  it('renders email', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText(/john@test\.com/)).toBeInTheDocument()
  })
  it('uses headerColor and bodyColor as inline styles', () => {
    const { container } = render(<MemberCard {...baseProps} />)
    const card = container.firstChild as HTMLElement
    expect(card.style.backgroundColor).toBe('rgb(55, 38, 22)')
  })
})
