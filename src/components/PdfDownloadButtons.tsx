import { useState } from 'react'
import type { DistrictCommitteeMember } from '../types/api'
import { downloadCommitteePDF } from '../utils/pdf/downloadCommitteePDF'
import { downloadBulkPDF } from '../utils/pdf/downloadBulkPDF'

interface PdfDownloadButtonsProps {
  members: DistrictCommitteeMember[]
  title: string
  getColors: (index: number) => { header: string; body: string }
  getDesignation: (member: DistrictCommitteeMember) => string
}

type ActiveDownload = 'committee' | 'bulk' | null

export function PdfDownloadButtons({
  members, title, getColors, getDesignation,
}: PdfDownloadButtonsProps) {
  const [active, setActive] = useState<ActiveDownload>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const isBusy = active !== null

  if (members.length === 0) return null

  async function handleCommitteeDownload() {
    setActive('committee')
    setProgress({ current: 0, total: members.length })
    try {
      await downloadCommitteePDF(members, title, getColors, getDesignation, (current, total) => {
        setProgress({ current, total })
      })
    } finally {
      setActive(null)
      setProgress(null)
    }
  }

  async function handleBulkDownload() {
    setActive('bulk')
    setProgress({ current: 0, total: members.length })
    try {
      await downloadBulkPDF(members, title, getColors, getDesignation, (current, total) => {
        setProgress({ current, total })
      })
    } finally {
      setActive(null)
      setProgress(null)
    }
  }

  return (
    <>
      <button onClick={handleCommitteeDownload} disabled={isBusy} className="theme-btn">
        {active === 'committee' ? '…' : '↓ PDF'}
      </button>
      <button onClick={handleBulkDownload} disabled={isBusy} className="theme-btn">
        {active === 'bulk' ? '…' : '↓ All as ZIP'}
      </button>

      {progress !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '32px 48px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#3b251a', marginBottom: '8px' }}>
              {active === 'committee' ? 'Generating PDF…' : 'Generating ZIP…'}
            </div>
            <div style={{ color: '#7c6f68', fontSize: '14px' }}>
              {progress.current} of {progress.total}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
