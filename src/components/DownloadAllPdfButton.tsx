import { useState, type ReactElement } from 'react'
import { downloadCombinedPdf, type CombinedDoc } from '../utils/pdf/downloadCombinedPdf'
import { buildStaticDocuments, buildDynamicDocuments, buildMasterDocuments, buildAppendixDocuments, renderTocElement } from '../utils/pdf/exportDocuments'
import type { PeopleCollector } from '../utils/pdf/collectPeople'

/** Which slice of the directory a button bundles into one combined PDF. */
export type DownloadScope = 'static' | 'dynamic' | 'master'

const CONFIG: Record<
  DownloadScope,
  {
    idle: string
    heading: string
    filename: string
    build: () => CombinedDoc[] | Promise<CombinedDoc[]>
    /** Font families the sheets in this scope actually use — passed to the capture
     *  so it embeds ONLY these (not all ~10 loaded families) per sheet, which is
     *  what keeps a large export from stalling. Omit to use the (slow) auto-embed. */
    fonts?: string[]
    /** Place the advertiser ads into the export: full-page ads fill the blank recto
     *  pages, half/quarter ads go two-up on appended pages, back cover last. Master only. */
    ads?: boolean
    /** Print the running page number (white, in the frame's navy corner disc) on every
     *  framed sheet. Ad / blank pages consume a number slot but aren't printed. Master only. */
    number?: boolean
    /** Build the back-matter appendix (DOBs + Bibliography) from the people collected across
     *  the content pages, appended after everything else. Master only. */
    appendix?: (collector: PeopleCollector) => CombinedDoc[]
    /** Overdraw the front Index/TOC pages with real page numbers. Master only. */
    toc?: { docLabel: string; render: (sectionPages: Record<string, number>) => ReactElement; settleMs?: number }
  }
> = {
  static: {
    idle: '⬇ Download All (PDF)',
    heading: 'Building the static pages PDF…',
    filename: 'District 3055 — Static Pages.pdf',
    build: buildStaticDocuments,
  },
  dynamic: {
    idle: '⬇ Download All (PDF)',
    heading: 'Building the directory PDF…',
    filename: 'District 3055 — Directory.pdf',
    build: buildDynamicDocuments,
    // Directory committee sheets use Petrona; the separator title pages use Geist.
    fonts: ['Petrona', 'Geist'],
  },
  master: {
    idle: '⬇ Download Everything (PDF)',
    heading: 'Building the complete directory PDF…',
    filename: 'District 3055 — Complete Directory.pdf',
    build: buildMasterDocuments,
    // The complete directory carries the advertiser ads (full ads fill the blank pages).
    ads: true,
    // …and prints running page numbers in the frame's navy corner disc (ads count toward
    // the numbering but carry no printed number).
    number: true,
    // …and ends with the DOBs (birthday) + Bibliography (name index) appendix, built from
    // everyone who appears across the book.
    appendix: buildAppendixDocuments,
    // …and overdraws the front Index/TOC with the real page numbers once the run is done.
    toc: { docLabel: 'Index', render: renderTocElement, settleMs: 900 },
    // Every sheet in the whole book — static leader/reference pages AND the directory
    // committee/club sheets — renders in only Petrona + Geist. Pass them so the capture
    // reuses one minimal font embed instead of html-to-image's auto-embed, which scans
    // the cross-origin Google Fonts stylesheet (throws SecurityError) and re-inlines all
    // families on every one of the ~87 sheets, stalling the export so it never downloads.
    fonts: ['Petrona', 'Geist'],
  },
}

/**
 * "Download All" as ONE combined, multi-page PDF (book/reading order). Reuses the
 * exact on-screen page components via the off-screen capture pipeline, so the export
 * always matches the live pages. Three scopes: the static pages, the API directory,
 * or everything. Only the pages we have are included — sections not built yet are
 * simply absent from the document list.
 */
export function DownloadAllPdfButton({ scope, className = 'theme-btn' }: { scope: DownloadScope; className?: string }) {
  const [progress, setProgress] = useState<{ label: string; current: number; total: number } | null>(null)
  const cfg = CONFIG[scope]

  async function handleDownload() {
    setProgress({ label: 'Preparing…', current: 0, total: 1 })
    try {
      const docs = await cfg.build()
      await downloadCombinedPdf(
        docs,
        cfg.filename,
        (label, current, total) => setProgress({ label, current, total }),
        cfg.fonts,
        cfg.ads,
        cfg.number,
        cfg.appendix,
        cfg.toc,
      )
    } catch (err) {
      console.error('[DownloadAllPdf] export failed', err)
      alert('Sorry — the PDF export failed. See the console for details.')
    } finally {
      setProgress(null)
    }
  }

  const pct = progress && progress.total ? Math.round((progress.current / progress.total) * 100) : 0
  // `current` can be fractional (it advances per sheet within a document), so floor it
  // for the "N of total" document count and cap it at the total.
  const currentDoc = progress ? Math.min(Math.floor(progress.current) + 1, progress.total) : 0

  return (
    <>
      <button onClick={handleDownload} disabled={progress !== null} className={className}>
        {progress !== null ? 'Generating…' : cfg.idle}
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
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1d2d6c', marginBottom: 10 }}>{cfg.heading}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 12, wordBreak: 'break-all' }}>{progress.label}</div>
            <div style={{ height: 8, background: '#e6e8ef', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1d2d6c', transition: 'width .2s' }} />
            </div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
              {currentDoc} of {progress.total}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
