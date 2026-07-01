import { useEffect, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react'
import './LeaderPage.css'
import dummyImg from '../assets/images/dummy.jpg'

// The complete page background (frame, header logos, watermark, curves, corner
// ornament) is a supplied Border page, served from /public. It is rendered as
// an <img> (not a CSS background) so it prints reliably regardless of the
// browser's "background graphics" print setting. We only overlay the per-leader
// content on top of it.
//
// Two variants — a right-hand (recto) and a left-hand (verso) frame, as in a
// bound book. Each document starts on the right; pages then alternate
// right → left → right… (matches DirectorySheet's convention).
const BORDER_BG = {
  right: '/border-right.svg',
  left: '/border-left.svg',
} as const

/** Which kind of page this is — shown as an eyebrow label up top. */
export type LeaderKind = 'profile' | 'message'

// Usable body height as a fraction of the page height (content starts ~15% down
// and must end above the bottom curve/watermark).
const SAFE = 0.78
// Smallest body scale we'll use to keep content on ONE page. Only a MINOR
// overflow gets absorbed by a mild shrink; anything longer paginates at full
// size onto a second framed page (per preference: pages over tiny type).
const ONE_PAGE_MIN_SCALE = 0.88

export interface LeaderPageProps {
  /** Whether this is a "Profile" or a "Message" — labelled up top on every sheet. */
  kind: LeaderKind
  /** Full name, shown large in navy italic serif. */
  name: string
  /** Designation/title, shown in gold with a divider line + dot. */
  designation: string
  /** Optional Rotary year, e.g. "2026-27", shown in navy below the title. */
  year?: string
  /** Portrait URL. Falls back to a placeholder when empty (first page only). */
  photo?: string
  /** Body copy. Split on blank lines into paragraphs; paginated across pages. */
  body: string
  /**
   * Global page index of this block's FIRST sheet within the whole document,
   * so backgrounds alternate continuously (right on even, left on odd) across a
   * Profile + Message pair. Defaults to 0 (starts on the right).
   */
  startIndex?: number
  /** Reports how many sheets this block rendered, so a parent can offset the next block. */
  onPageCount?: (count: number) => void
}

/**
 * Trigger a print-to-PDF of the leader page(s) currently on screen. The print
 * stylesheet (LeaderPage.css) sizes each page to B5 and hides all app chrome,
 * so "Save as PDF" in the dialog yields a pixel-perfect, vector, print-quality
 * B5 PDF. `filename` becomes the default save name (via the document title).
 */
export function downloadLeaderPdf(filename: string) {
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
 * One framed B5 sheet: the Border.svg background with the identity block and a
 * slice of body paragraphs overlaid. `continuation` pages omit the photo so the
 * body uses the full width; `scale` shrinks the body type (1 = full size).
 */
function LeaderSheet({
  kind,
  side,
  name,
  designation,
  year,
  photo,
  paragraphs,
  continuation = false,
  scale = 1,
  contentRef,
}: {
  kind: LeaderKind
  side: 'left' | 'right'
  name: string
  designation: string
  year?: string
  photo?: string
  paragraphs: string[]
  continuation?: boolean
  scale?: number
  contentRef?: Ref<HTMLDivElement>
}) {
  return (
    <article className="leader-page">
      <img className="lp-bg" src={BORDER_BG[side]} alt="" aria-hidden="true" />

      <div className="lp-content" ref={contentRef} style={{ '--lp-scale': scale } as React.CSSProperties}>
        <div className="lp-kind">{kind === 'profile' ? 'Profile' : 'Message'}</div>

        {!continuation && (
          <div className="lp-photo-frame">
            <img
              className="lp-photo"
              src={photo || dummyImg}
              alt={name}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = dummyImg
              }}
            />
          </div>
        )}

        <div className="lp-identity">
          <h1 className="lp-name">{name}</h1>
          <div className="lp-title-row">
            <span className="lp-title">{designation}</span>
            <span className="lp-title-line" />
            <span className="lp-title-dot" />
          </div>
          {year && <div className="lp-year">{year}</div>}
        </div>

        <div className="lp-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  )
}

/**
 * A leader profile/message rendered across one or more framed B5 sheets. The
 * body is measured against the page height and split so nothing overflows:
 *  - fits at full size            → one page
 *  - fits only with a mild shrink → one page, lightly scaled (≥ ONE_PAGE_MIN_SCALE)
 *  - still too long               → paginated full-size across continuation pages
 * Continuation pages repeat the name/designation header (no photo) for context.
 */
export function LeaderPage(props: LeaderPageProps) {
  const paras = useMemo(
    () =>
      props.body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [props.body],
  )

  const [plan, setPlan] = useState<{ pages: string[][]; scale: number }>({ pages: [paras], scale: 1 })
  const firstRef = useRef<HTMLDivElement>(null)
  const contRef = useRef<HTMLDivElement>(null)

  const startIndex = props.startIndex ?? 0
  const onPageCount = props.onPageCount
  // Report the sheet count up so a parent can keep the right/left alternation
  // running continuously into the next block (e.g. Message after Profile).
  useEffect(() => {
    onPageCount?.(plan.pages.length)
  }, [onPageCount, plan.pages.length])

  useLayoutEffect(() => {
    const measure = () => {
      const first = firstRef.current
      const cont = contRef.current
      if (!first || !cont) return
      const page = first.closest('.leader-page') as HTMLElement | null
      const pageH = page?.clientHeight ?? 0
      if (!pageH) return
      const budget = pageH * SAFE

      // How many leading paragraphs fit on page 1 (with photo + identity) at a
      // given scale; returns paras.length if they all fit.
      const firstParas = Array.from(first.querySelectorAll<HTMLElement>('.lp-body p'))
      const firstCut = (scale: number) => {
        first.style.setProperty('--lp-scale', String(scale))
        for (let i = 0; i < firstParas.length; i++) {
          if (firstParas[i].offsetTop + firstParas[i].offsetHeight > budget) return i
        }
        return paras.length
      }

      // Largest scale in [ONE_PAGE_MIN_SCALE, 1] that fits everything on ONE
      // page — absorbs a minor overflow with the mildest shrink; the min scale
      // is always tested so we don't skip a just-fits case.
      const scales: number[] = []
      for (let s = 1; s > ONE_PAGE_MIN_SCALE + 1e-6; s -= 0.03) scales.push(s)
      scales.push(ONE_PAGE_MIN_SCALE)
      for (const s of scales) {
        if (firstCut(s) >= paras.length) {
          setPlan({ pages: [paras], scale: s })
          return
        }
      }
      // Still too long even at the minimum scale → paginate full-size across
      // continuation pages.
      const c1 = firstCut(1)
      const pages: string[][] = [paras.slice(0, c1)]

      // Continuation layout (identity, no photo, full width): measure the header
      // height and each paragraph's height so we can pack the rest.
      cont.style.setProperty('--lp-scale', '1')
      const contParas = Array.from(cont.querySelectorAll<HTMLElement>('.lp-body p'))
      const headH = contParas.length ? contParas[0].offsetTop : 0
      const usable = Math.max(budget - headH, budget * 0.5)
      const paraH = (i: number) => {
        const el = contParas[i]
        if (!el) return 0
        const next = contParas[i + 1]
        return next ? next.offsetTop - el.offsetTop : el.offsetHeight
      }

      let cur: string[] = []
      let used = 0
      for (let i = c1; i < paras.length; i++) {
        const h = paraH(i)
        if (used + h > usable && cur.length) {
          pages.push(cur)
          cur = []
          used = 0
        }
        cur.push(paras[i])
        used += h
      }
      if (cur.length) pages.push(cur)
      setPlan({ pages, scale: 1 })
    }

    measure()
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    // Re-measure once the web font and Border.svg settle (metrics change on swap).
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
    if (fonts?.ready) fonts.ready.then(measure)
    const t = window.setTimeout(measure, 500)
    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [props.body, paras])

  return (
    <>
      {plan.pages.map((group, i) => (
        <LeaderSheet
          key={i}
          kind={props.kind}
          side={(startIndex + i) % 2 === 0 ? 'right' : 'left'}
          name={props.name}
          designation={props.designation}
          year={props.year}
          photo={props.photo}
          paragraphs={group}
          continuation={i > 0}
          scale={plan.scale}
        />
      ))}

      {/* Hidden probes (all paragraphs) used only to measure the split. */}
      <div
        className="no-print"
        aria-hidden
        style={{ position: 'absolute', left: -100000, top: 0, visibility: 'hidden', pointerEvents: 'none' }}
      >
        <LeaderSheet
          kind={props.kind}
          side="right"
          name={props.name}
          designation={props.designation}
          year={props.year}
          photo={props.photo}
          paragraphs={paras}
          contentRef={firstRef}
        />
        <LeaderSheet
          kind={props.kind}
          side="right"
          name={props.name}
          designation={props.designation}
          year={props.year}
          photo={props.photo}
          paragraphs={paras}
          continuation
          contentRef={contRef}
        />
      </div>
    </>
  )
}
