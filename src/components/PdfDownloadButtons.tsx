import { useState } from 'react'
import type { DistrictCommitteeMember } from '../types/api'
import { downloadBulkPDF } from '../utils/pdf/downloadBulkPDF'

interface PdfDownloadButtonsProps {
  members: DistrictCommitteeMember[]
  title: string
  getColors: (index: number) => { header: string; body: string }
  getDesignation: (member: DistrictCommitteeMember) => string
  externalBusy?: boolean
}

export function PdfDownloadButtons({
  members, title, getColors, getDesignation, externalBusy,
}: PdfDownloadButtonsProps) {
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const isBusy = progress !== null || (externalBusy ?? false)

  if (members.length === 0) return null

  async function handleBulkDownload() {
    setProgress({ current: 0, total: members.length })
    try {
      await downloadBulkPDF(members, title, getColors, getDesignation, (current, total) => {
        setProgress({ current, total })
      })
    } finally {
      setProgress(null)
    }
  }

  return (
    <>
      <button onClick={handleBulkDownload} disabled={isBusy} className="theme-btn">
        {progress !== null ? '…' : '↓ All as ZIP'}
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
              Generating PDFs…
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
