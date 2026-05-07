import { useState } from 'react'
import type { DistrictCommitteeMember } from '../types/api'
import { downloadCommitteePDF } from '../utils/pdf/downloadCommitteePDF'

interface PdfDownloadButtonsProps {
  members: DistrictCommitteeMember[]
  title: string
  getColors: (index: number) => { header: string; body: string }
  getDesignation: (member: DistrictCommitteeMember) => string
}

export function PdfDownloadButtons({
  members, title, getColors, getDesignation,
}: PdfDownloadButtonsProps) {
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)

  if (members.length === 0) return null

  async function handleDownload() {
    setProgress({ current: 0, total: members.length })
    try {
      await downloadCommitteePDF(members, title, getColors, getDesignation, (current, total) => {
        setProgress({ current, total })
      })
    } finally {
      setProgress(null)
    }
  }

  return (
    <>
      <button onClick={handleDownload} disabled={progress !== null} className="theme-btn">
        {progress !== null ? '…' : '↓ PDF'}
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
              Generating PDF…
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
