import { useState } from 'react'
import { downloadDirectoryZip } from '../utils/pdf/downloadDirectoryZip'

/** Bulk export: every committee / sub-committee / club / AG / DG section as a
 *  PDF, organised into folders, bundled into one ZIP. Reuses the same print
 *  components as the individual "Download PDF" so the two never diverge. */
export function DirectoryZipButton() {
  const [progress, setProgress] = useState<{ label: string; current: number; total: number } | null>(null)

  async function handleDownload() {
    setProgress({ label: 'Starting…', current: 0, total: 1 })
    try {
      await downloadDirectoryZip((label, current, total) => setProgress({ label, current, total }))
    } catch (err) {
      console.error('[DirectoryZip] export failed', err)
      alert('Sorry — the bulk export failed. See the console for details.')
    } finally {
      setProgress(null)
    }
  }

  const pct = progress && progress.total ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <>
      <button onClick={handleDownload} disabled={progress !== null} className="theme-btn">
        {progress !== null ? 'Generating…' : '⬇ Download All (ZIP)'}
      </button>

      {progress !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: '28px 40px', textAlign: 'center', minWidth: 340 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1d2d6c', marginBottom: 10 }}>
              Generating directory PDFs…
            </div>
            <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 12, wordBreak: 'break-all' }}>{progress.label}</div>
            <div style={{ height: 8, background: '#e6e8ef', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1d2d6c', transition: 'width .2s' }} />
            </div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
              {progress.current} of {progress.total}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
