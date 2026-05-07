import { useState } from 'react'
import { downloadAllCommitteesZip } from '../utils/pdf/downloadAllCommitteesZip'

export function DirectoryZipButton() {
  const [progress, setProgress] = useState<{ label: string; current: number; total: number } | null>(null)

  async function handleDownload() {
    setProgress({ label: 'Starting…', current: 0, total: 1 })
    try {
      await downloadAllCommitteesZip((label, current, total) => {
        setProgress({ label, current, total })
      })
    } finally {
      setProgress(null)
    }
  }

  return (
    <>
      <button onClick={handleDownload} disabled={progress !== null} className="theme-btn">
        {progress !== null ? '…' : '↓ All Committees as ZIP'}
      </button>

      {progress !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '32px 48px',
            textAlign: 'center', minWidth: '300px',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#3b251a', marginBottom: '8px' }}>
              Generating All Committees…
            </div>
            <div style={{ color: '#7c6f68', fontSize: '14px', marginBottom: '4px' }}>
              {progress.label}
            </div>
            <div style={{ color: '#7c6f68', fontSize: '13px' }}>
              {progress.current} of {progress.total} committees
            </div>
          </div>
        </div>
      )}
    </>
  )
}
