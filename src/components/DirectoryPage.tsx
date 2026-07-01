import type { ReactNode } from 'react'
import { useViewMode, type ViewMode } from '../hooks/useViewMode'
import { printPdf } from '../utils/printPdf'
import './DirectoryPage.css'

/**
 * Shared shell for every directory module. Two distinct views:
 *  - 'web'   → a digital, responsive display (branded banner + flowing cards)
 *  - 'print' → the Border.svg B5 sheets used to produce the PDF / physical copy
 * Download PDF always prints the 'print' view.
 */
export function DirectoryPage({
  title,
  pdfName,
  toolbarMiddle,
  children,
}: {
  title: string
  pdfName: string
  toolbarMiddle?: ReactNode
  children: (mode: ViewMode) => ReactNode
}) {
  const [mode, setMode] = useViewMode()

  const onDownload = () => {
    // The PDF is always the print view; switch to it first if needed.
    if (mode !== 'print') {
      setMode('print')
      setTimeout(() => printPdf(pdfName), 500)
    } else {
      printPdf(pdfName)
    }
  }

  return (
    <div className="dir-wrap" style={{ background: '#e9eaee', minHeight: '100vh', padding: '14px 0 30px' }}>
      <div className="auto-container no-print dir-toolbar">
        <button onClick={() => window.history.back()} className="theme-btn">
          ← Back
        </button>
        <h1 className="dir-title">{title}</h1>
        <div className="dir-toolbar-right">
          {toolbarMiddle}
          <div className="view-toggle">
            <button className={mode === 'web' ? 'active' : ''} onClick={() => setMode('web')}>
              Web
            </button>
            <button className={mode === 'print' ? 'active' : ''} onClick={() => setMode('print')}>
              Print
            </button>
          </div>
          <button onClick={onDownload} className="theme-btn">
            ⬇ Download PDF
          </button>
        </div>
      </div>

      {children(mode)}
    </div>
  )
}

/** Digital web container — just the flowing cards, no background or banner. */
export function WebDoc({ children }: { children: ReactNode }) {
  return <div className="dir-web">{children}</div>
}
