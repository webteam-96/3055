import { Children, Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import './ReferencePage.css'
import { useSheetBg } from './SheetBg'

/**
 * Print-to-PDF the reference sheets currently on screen. The print stylesheet
 * (ReferencePage.css) sizes each sheet to B5 and hides app chrome, so "Save as
 * PDF" yields a pixel-perfect B5 PDF. `filename` becomes the default save name.
 */
export function printReferencePdf(filename: string) {
  const previous = document.title
  document.title = filename
  const restore = () => {
    document.title = previous
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}

/**
 * Standard chrome for a reference document: grey backdrop, a Back button and an
 * optional Download-PDF button (both hidden in print), then the sheets. Mirrors
 * the Profile/Message detail layout so the two feel identical.
 */
export function ReferenceDoc({
  title,
  children,
  pdfName,
}: {
  title: string
  children: ReactNode
  pdfName?: string
}) {
  return (
    <div className="ref-detail-wrap" style={{ background: '#e9eaee', minHeight: '100vh', padding: '18px 0 32px' }}>
      <div
        className="auto-container no-print"
        style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', gap: 12 }}
      >
        <button onClick={() => window.history.back()} className="theme-btn">
          ← Back
        </button>
        <button onClick={() => printReferencePdf(pdfName || `${title} — Rotary District 3055`)} className="theme-btn">
          ⬇ Download PDF
        </button>
      </div>
      {children}
    </div>
  )
}

// Same supplied Border page background as the Profile/Message (LeaderPage) sheets,
// served from /public and rendered as an <img> so it prints regardless of the
// browser's "background graphics" setting. Right-hand (recto) and left-hand
// (verso) frames alternate like a bound book.
const BORDER_BG = {
  right: '/border-right.svg',
  left: '/border-left.svg',
} as const

/**
 * A cover / title sheet: the SAME framed Border background + header logos as the
 * reference sheets, but with a single large section title centred both across and
 * down the page (its true middle). Used as a section divider — e.g. the
 * "PROFILE & MESSAGE" and "ROTARY INFORMATION" title pages.
 */
export function ReferenceTitlePage({
  title,
  subtitle,
  pageIndex = 0,
}: {
  title: ReactNode
  /** Optional short description shown (20px) beneath the title; omit for none. */
  subtitle?: ReactNode
  /** 0-based sheet index; picks the recto/verso frame like {@link ReferencePage}. */
  pageIndex?: number
}) {
  const sheetBg = useSheetBg()
  return (
    <article className="ref-page" style={{ background: sheetBg }}>
      <img className="ref-bg" src={BORDER_BG[pageIndex % 2 === 0 ? 'right' : 'left']} alt="" aria-hidden="true" />
      <div className="ref-cover">
        <div className="ref-cover-inner">
          <h1 className="ref-cover-title">{title}</h1>
          {subtitle ? <p className="ref-cover-subtitle">{subtitle}</p> : null}
        </div>
      </div>
    </article>
  )
}

export interface ReferencePageProps {
  /** 0-based sheet index within the document; picks the recto/verso frame. */
  pageIndex?: number
  /** Red title banner text (omit for a bannerless sheet). */
  title?: ReactNode
  /**
   * Body density. 1 = the Profile/Message body size (1.95cqw). Denser source
   * pages pass a smaller value so all their content fits one B5 sheet while
   * keeping the same Petrona type hierarchy as the Profile/Message pages.
   */
  density?: number
  /** Override the fraction of the safe area to fill before breaking to the next
   *  sheet (default {@link FILL} = 0.97). A higher value packs more per sheet —
   *  used by the Milestones, whose floated photo makes the auto-measure over-
   *  estimate heights, so the section otherwise breaks early and wastes pages. */
  fill?: number
  /** Extra class on the content area (e.g. two-column pages). */
  contentClassName?: string
  /** Skip the built-in auto-pagination and render exactly ONE sheet. Use when the
   *  caller has already split its content into per-sheet slices (e.g. a table
   *  paginated by row) and just wants each slice on its own framed sheet. */
  noPaginate?: boolean
  children: ReactNode
}

// Uniform reference-sheet body size — the single default size for ALL reference
// pages (and new ones), matching the Profile/Message body that renders at 1.8014cqw.
// The Founder page keeps its own larger size via `.ref-content.founder`.
const REF_BASE = '1.8014cqw'
const SHEET_ASPECT = 697.32 / 527.24 // B5 border artwork proportions
// Content safe area = the sheet minus the 12% top and 8% bottom margins (see .ref-content).
const CONTENT_FRACTION = 1 - 0.12 - 0.08
// Fill a hair short of the safe area so the last line never touches the bottom curve.
const FILL = 0.97

/**
 * One or more framed B5 sheets for a static "reference" page (Founder, Zones, Awards,
 * Protocol, Donors, Rotary Information …). The Border.svg frame and Petrona typography
 * match the Profile/Message design. The body renders at a single uniform size
 * (`REF_BASE`); when its content is taller than one sheet it flows onto additional
 * sheets automatically — measured per top-level child — so nothing is clipped. The
 * banner title appears on the first sheet only. (`density` is accepted but no longer
 * scales the body: the size is uniform.)
 */
export function ReferencePage({
  pageIndex = 0,
  title,
  fill,
  contentClassName = '',
  noPaginate = false,
  children,
}: ReferencePageProps) {
  const items = Children.toArray(children)
  const count = items.length
  const sheetBg = useSheetBg()
  const [groups, setGroups] = useState<number[][]>(() => [Array.from({ length: count }, (_, i) => i)])
  const probeRef = useRef<HTMLDivElement>(null)
  const sigRef = useRef('')

  useLayoutEffect(() => {
    if (noPaginate) return
    const measure = () => {
      const probe = probeRef.current
      const page = probe?.parentElement
      if (!probe || !page) return
      const width = page.clientWidth
      if (!width) return
      // Usable content height of ONE sheet (continuation sheets carry no title).
      const usable = width * SHEET_ASPECT * CONTENT_FRACTION * (fill ?? FILL)
      const kids = Array.from(probe.children) as HTMLElement[]
      const hasTitle = title != null
      const titleH = hasTitle && kids[0] ? (kids[1] ? kids[1].offsetTop - kids[0].offsetTop : kids[0].offsetHeight) : 0
      const itemEls = hasTitle ? kids.slice(1) : kids
      const itemH = (i: number) => {
        const el = itemEls[i]
        if (!el) return 0
        const next = itemEls[i + 1]
        return next ? next.offsetTop - el.offsetTop : el.offsetHeight
      }
      const pages: number[][] = []
      let cur: number[] = []
      let used = titleH // first sheet reserves room for the title banner
      for (let i = 0; i < items.length; i++) {
        const h = itemH(i)
        // A ~zero-height item (e.g. the trailing clearfix div) must never start a new
        // sheet — otherwise a page whose content fills the last sheet exactly gets an
        // extra, entirely blank sheet appended.
        if (h > 1 && used + h > usable && cur.length) {
          pages.push(cur)
          cur = []
          used = 0 // continuation sheets have no title, so the full height is free
        }
        cur.push(i)
        used += h
      }
      if (cur.length) pages.push(cur)
      const next = pages.length ? pages : [[]]
      // Only update when the split actually changes, so this never re-renders in a loop.
      const sig = next.map((g) => g.join('.')).join('|')
      if (sig !== sigRef.current) {
        sigRef.current = sig
        setGroups(next)
      }
    }
    measure()
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
    if (fonts?.ready) fonts.ready.then(measure)
    const t = window.setTimeout(measure, 400)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [count, title, noPaginate, fill])

  // Pre-split content: render exactly one sheet, no measurement/pagination.
  if (noPaginate) {
    return (
      <article className="ref-page" style={{ background: sheetBg }}>
        <img className="ref-bg" src={BORDER_BG[pageIndex % 2 === 0 ? 'right' : 'left']} alt="" aria-hidden="true" />
        <div className={`ref-content ${contentClassName}`} style={{ '--ref-base': REF_BASE } as React.CSSProperties}>
          {title != null && <div className="ref-title">{title}</div>}
          {children}
        </div>
      </article>
    )
  }

  return (
    <>
      {groups.map((idxs, pi) => (
        <article className="ref-page" key={pi} style={{ background: sheetBg }}>
          <img
            className="ref-bg"
            src={BORDER_BG[(pageIndex + pi) % 2 === 0 ? 'right' : 'left']}
            alt=""
            aria-hidden="true"
          />
          <div className={`ref-content ${contentClassName}`} style={{ '--ref-base': REF_BASE } as React.CSSProperties}>
            {pi === 0 && title != null && <div className="ref-title">{title}</div>}
            {idxs.map((i) => (
              <Fragment key={i}>{items[i]}</Fragment>
            ))}
          </div>
        </article>
      ))}
      {/* Hidden probe: every item in an unbounded content box at the real sheet width,
          so we can measure each item's height and pack them onto as many sheets as needed. */}
      <article className="ref-page ref-probe" aria-hidden>
        <div
          className={`ref-content ref-content--probe ${contentClassName}`}
          style={{ '--ref-base': REF_BASE } as React.CSSProperties}
          ref={probeRef}
        >
          {title != null && <div className="ref-title">{title}</div>}
          {items.map((it, i) => (
            <Fragment key={i}>{it}</Fragment>
          ))}
        </div>
      </article>
    </>
  )
}

/** Blue bold section heading with the trailing rule, as in the source pages. */
export function RefHeading({ children, rule = true }: { children: ReactNode; rule?: boolean }) {
  return (
    <h2 className={`ref-h${rule ? ' ref-h--rule' : ''}`}>
      <span>{children}</span>
    </h2>
  )
}
