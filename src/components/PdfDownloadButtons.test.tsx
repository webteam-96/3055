import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PdfDownloadButtons } from './PdfDownloadButtons'
import type { DistrictCommitteeMember } from '../types/api'

const mockMember: DistrictCommitteeMember = {
  DistrictDesignation: 'Zone Chair',
  name: 'John Doe',
  ClubName: 'Rotary Club Test',
  MobileNumber: '9876543210',
  BloodGroup: 'A+',
  Bloodgrp: 'A+',
  MailID: 'john@example.com',
  Address: '',
  DOB: '',
  DOA: '',
  RotaryID: '',
  img: '',
  SpouseName: '',
  SpousePhoto: '',
  SpouseDOB: '',
  Spouse_DOB: '',
  Spouse_Mobile_Number: '',
  SpouseMobileNumber: '',
  SpouseMobile: '',
  Keywords: '',
  classification: '',
}

const defaultProps = {
  members: [mockMember],
  title: 'Test Committee',
  getColors: () => ({ header: '#E8D8CE', body: '#372616' }),
  getDesignation: (m: DistrictCommitteeMember) => m.DistrictDesignation,
}

describe('PdfDownloadButtons', () => {
  it('renders null when members array is empty', () => {
    const { container } = render(
      <PdfDownloadButtons {...defaultProps} members={[]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders ZIP download button when members are present', () => {
    render(<PdfDownloadButtons {...defaultProps} />)
    expect(screen.getByRole('button', { name: /↓ All as ZIP/i })).toBeDefined()
  })

  it('ZIP button is enabled initially', () => {
    render(<PdfDownloadButtons {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /↓ All as ZIP/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('ZIP button is disabled when externalBusy is true', () => {
    render(<PdfDownloadButtons {...defaultProps} externalBusy={true} />)
    const btn = screen.getByRole('button', { name: /↓ All as ZIP/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
