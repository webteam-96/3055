import { useState, type ReactNode } from 'react'
import { saveAs } from 'file-saver'
import { useViewMode, type ViewMode } from '../hooks/useViewMode'
import { SheetBg, useSheetBg } from './SheetBg'
import { withOffscreen } from '../utils/pdf/renderOffscreen'
import {
  inlineImages,
  rasterizeBackgrounds,
  waitForImages,
  sheetsToPdfBlob,
  buildFontEmbedCSS,
} from '../utils/pdf/captureToPdf'
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
  const [downloading, setDownloading] = useState(false)
  // The current route's section tint (provided by __root). Re-provided into the
  // off-screen capture below, which renders in a fresh root without this provider.
  const sheetBg = useSheetBg()

  // Settings-proof PDF: render the PRINT view off-screen and rasterize its B5
  // sheets straight into a PDF file (same pipeline as "Download All"), so the
  // output matches the on-screen Print view exactly — independent of the browser's
  // Save-as-PDF dialog (paper size / margins / scale). Works from either view.
  const onDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      let blob: Blob | null = null
      // Every directory print sheet uses Petrona (cards) and Geist (title page); embed
      // ONLY those, once, so a many-sheet section (e.g. the ~40-sheet club list) doesn't
      // stall re-embedding all ~10 loaded font families on every single sheet. Undefined
      // (fetch failed) falls back to the slower auto-embed rather than breaking.
      const fontEmbedCSS = await buildFontEmbedCSS(['Petrona', 'Geist'])
      await withOffscreen(<SheetBg color={sheetBg}>{children('print')}</SheetBg>, async (root) => {
        await inlineImages(root)
        await rasterizeBackgrounds(root)
        await waitForImages(root)
        blob = await sheetsToPdfBlob(root, fontEmbedCSS)
      })
      if (blob) saveAs(blob, /\.pdf$/i.test(pdfName) ? pdfName : `${pdfName}.pdf`)
      else console.error('Download PDF: no sheets were produced.')
    } catch (err) {
      console.error('Download PDF failed:', err)
    } finally {
      setDownloading(false)
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
          <button onClick={onDownload} className="theme-btn" disabled={downloading}>
            {downloading ? 'Generating PDF…' : '⬇ Download PDF'}
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
