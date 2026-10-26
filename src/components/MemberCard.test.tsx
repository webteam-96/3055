import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemberCard } from './MemberCard'

const baseProps = {
  designation: 'Zone Chair',
  name: 'John Doe',
  mobile: '9876543210',
  email: 'john@example.com',
  dob: '01/01',
  doa: '15/03',
  photo: '',
  headerColor: '#E8D8CE',
  bodyColor: '#372616',
}

describe('MemberCard', () => {
  it('renders designation in the header', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText('Zone Chair')).toBeDefined()
  })

  it('renders member name', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.getByText('John Doe')).toBeDefined()
  })

  it('renders club when provided', () => {
    render(<MemberCard {...baseProps} club="Rotary Club" />)
    expect(screen.getByText('Rotary Club')).toBeDefined()
  })

  it('renders spouse fields when spouseName is provided', () => {
    render(<MemberCard {...baseProps} spouseName="Jane Doe" spouseDob="02/06" />)
    expect(screen.getByText('Jane Doe')).toBeDefined()
  })

  it('hides the spouse section when spouseName is empty (e.g. BOD members)', () => {
    render(<MemberCard {...baseProps} spouseName="" spouseDob="" />)
    expect(screen.queryByText('Spouse Name:')).toBeNull()
    expect(screen.queryByText('Spouse DOB:')).toBeNull()
  })

  it('hides the spouse section when spouseName is omitted', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.queryByText('Spouse Name:')).toBeNull()
  })
})
