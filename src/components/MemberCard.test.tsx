import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
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

describe('MemberCard — PDF download button', () => {
  it('does not render download button when onDownloadPdf is not provided', () => {
    render(<MemberCard {...baseProps} />)
    expect(screen.queryByRole('button', { name: /↓ PDF/i })).toBeNull()
  })

  it('renders download button when onDownloadPdf is provided', () => {
    render(<MemberCard {...baseProps} onDownloadPdf={vi.fn()} />)
    expect(screen.getByRole('button', { name: /↓ PDF/i })).toBeDefined()
  })

  it('shows "Generating…" and disables button when isDownloading is true', () => {
    render(<MemberCard {...baseProps} onDownloadPdf={vi.fn()} isDownloading={true} />)
    const btn = screen.getByRole('button', { name: /Generating/i }) as HTMLButtonElement
    expect(btn).toBeDefined()
    expect(btn.disabled).toBe(true)
  })

  it('button is enabled when isDownloading is false', () => {
    render(<MemberCard {...baseProps} onDownloadPdf={vi.fn()} isDownloading={false} />)
    const btn = screen.getByRole('button', { name: /↓ PDF/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('calls onDownloadPdf when button is clicked', () => {
    const onDownloadPdf = vi.fn()
    render(<MemberCard {...baseProps} onDownloadPdf={onDownloadPdf} />)
    fireEvent.click(screen.getByRole('button', { name: /↓ PDF/i }))
    expect(onDownloadPdf).toHaveBeenCalledTimes(1)
  })
})
