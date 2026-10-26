import { useEffect, useLayoutEffect, useMemo, useRef, useState, type Ref, type SyntheticEvent } from 'react'
import './LeaderPage.css'
import { rotaryLogo } from './NoPhoto'
import { useSheetBg } from './SheetBg'

// The Rotary-logo "no photograph" placeholder shown when a leader's portrait is missing or
// fails to load. CONTAIN (not .lp-photo's cover) on a white mat, so the round mark isn't cropped.
const LP_LOGO_STYLE = { objectFit: 'contain', padding: '10%', background: '#fff' } as const
const toLeaderLogo = (e: SyntheticEvent<HTMLImageElement>) => {
  const t = e.currentTarget
  if (t.getAttribute('src') === rotaryLogo) return
  t.src = rotaryLogo
  Object.assign(t.style, LP_LOGO_STYLE)
}

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
// Smallest body scale we'll use to keep content on ONE page. Long profiles are
// compressed onto a single sheet down to this floor before we fall back to
// paginating at full size; below it the type would get too small to read.
const ONE_PAGE_MIN_SCALE = 0.7
// Floor for the opt-in `maxPages` fit: a document asked to fit within N sheets
// is shrunk no smaller than this before we stop (and simply overflow to more
// pages), so the type never becomes unreadable.
const MAXPAGES_MIN_SCALE = 0.5
// Ceiling for growing SHORT one-page bodies to fill the spare space. 1 keeps the
// design size; up to this the type enlarges when a profile/message leaves the
// page half-empty. Kept modest so grown pages still read as the same design.
const MAX_SCALE = 1.35
// The maxPages fit may use MORE of the sheet than the default band, so a
// page-capped document fills its sheets and its type can be as large as possible.
// NB: these bands are measured from the CONTENT top (10%), so 0.82 puts the last
// line at ~92% of the sheet — the same bottom limit the reference pages use, still
// above the bottom curve artwork.
const MAXPAGES_SAFE = 0.82
// Scale precision for the maxPages binary search.
const FIT_TOLERANCE = 0.01
// The growth guess targets slightly less than the full available height, so the
// validation pass (which measures the real reflowed height) usually confirms the
// first guess instead of having to step down.
const GROWTH_SLACK = 0.94

// Base body sizes (in cqw), matching the .lp-body p defaults in LeaderPage.css.
// The auto-fit multiplies these by the chosen scale and hands the finished
// lengths to CSS via the two custom properties below (a whole length reliably
// re-evaluates; `calc(cqw * var(--number))` does not).
const BASE_PARA_FS = 1.95
const BASE_PARA_GAP = 1.5
// Sheet width the web preview renders at (`.leader-page`), so 1cqw = 7px there.
// Used to convert a per-person px nudge into the cqw the design is built in — the
// nudge stays proportional in print (B5) rather than being a fixed print size.
const DESIGN_WIDTH_PX = 700
function scaleVars(scale: number, bodyFontDeltaPx = 0): React.CSSProperties {
  const deltaCqw = (bodyFontDeltaPx / DESIGN_WIDTH_PX) * 100
  return {
    '--lp-para-fs': `${(BASE_PARA_FS * scale + deltaCqw).toFixed(4)}cqw`,
    '--lp-para-gap': `${(BASE_PARA_GAP * scale).toFixed(4)}cqw`,
  } as React.CSSProperties
}

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
  /**
   * Optional cap on the number of sheets. When set, the whole body is shrunk to
   * the largest scale that still packs into this many pages (down to
   * MAXPAGES_MIN_SCALE). Omit for the default one-page-or-paginate behaviour.
   */
  maxPages?: number
  /**
   * Optional override for the content block's top offset (CSS length, e.g.
   * "10%"). Shifts the whole identity+body block up/down from the default 15%.
   * Omit to keep the default position.
   */
  contentTop?: string
  /**
   * Optional body-size nudge in px at the preview width (negative = smaller),
   * applied on top of the auto-fit scale. Use to fine-tune one person's body
   * copy; omit for the auto-fitted size.
   */
  bodyFontDeltaPx?: number
  /**
   * Fixed body font size in cqw that BYPASSES the auto-fit: the body renders on a
   * single sheet at exactly this size (no shrink-to-fit search). Pair with
   * `bodyLineHeight` to tighten the leading so all the copy still fits one page.
   */
  bodyFontCqw?: number
  /** Body line-height (default 1.62); lower values pack more lines per page. */
  bodyLineHeight?: number
  /** Extra class on the photo frame, for per-person framing tweaks (size/crop). */
  photoVariant?: string
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
  contentTop,
  signoff = false,
  bodyFontDeltaPx = 0,
  bodyLineHeight,
  photoVariant,
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
  contentTop?: string
  /** The final paragraph is a Message's complimentary close — render it bold. */
  signoff?: boolean
  /** Per-person body-size nudge in px (negative = smaller), applied on top of the
   *  auto-fit scale. Not applied to the measurement probes: it only ever shrinks
   *  the type, so the fitted layout keeps its slack and can't overflow. */
  bodyFontDeltaPx?: number
  /** Body line-height override (default 1.62); lower packs more lines per page. */
  bodyLineHeight?: number
  /** Extra class on the photo frame, for per-person framing tweaks (size/crop). */
  photoVariant?: string
  contentRef?: Ref<HTMLDivElement>
}) {
  const vars = scaleVars(scale, bodyFontDeltaPx)
  const sheetBg = useSheetBg()
  const contentStyle = {
    ...vars,
    ...(contentTop ? { top: contentTop } : {}),
    ...(bodyLineHeight != null ? { '--lp-line-height': String(bodyLineHeight) } : {}),
  } as React.CSSProperties
  return (
    // Per-section tint shows through the frame's now-transparent interior (inline so
    // html-to-image / print capture it).
    <article className="leader-page" style={{ background: sheetBg }}>
      <img className="lp-bg" src={BORDER_BG[side]} alt="" aria-hidden="true" />

      <div className="lp-content" ref={contentRef} style={contentStyle}>
        {/* The eyebrow + photo + identity header appears ONLY on the first sheet.
            Continuation sheets carry the body alone so the title isn't repeated. */}
        {!continuation && (
          <>
            <div className="lp-kind">{kind === 'profile' ? 'Profile' : 'Message'}</div>

            <div className={`lp-photo-frame${photoVariant ? ` ${photoVariant}` : ''}`}>
              {/* The clip wrapper — not the frame — owns the rounded corners and
                  `overflow: hidden`, so a per-person zoom on the <img> is cropped
                  at the image box and never spills over the frame's white mat.
                  This keeps the white-inner / gold-outer border visible on every
                  photo, zoomed or not. */}
              <div className="lp-photo-clip">
                <img
                  className="lp-photo"
                  src={photo || rotaryLogo}
                  alt={name}
                  style={photo ? undefined : LP_LOGO_STYLE}
                  onError={toLeaderLogo}
                />
              </div>
            </div>

            <div className="lp-identity">
              <h1 className="lp-name">{name}</h1>
              {/* A designation may carry a `\n`-separated continuation (e.g. RI
                  Director + its "2025-27 (Zone 5 & 6)" term line). The first line
                  keeps the gold title + rule/dot; the rest render in the same gold
                  style, tucked close beneath it. Single-line designations are
                  unaffected — `rest` is empty. */}
              {(() => {
                const [firstLine, ...rest] = designation.split('\n')
                return (
                  <>
                    <div className="lp-title-row">
                      <span className="lp-title">{firstLine}</span>
                      <span className="lp-title-line" />
                      <span className="lp-title-dot" />
                    </div>
                    {rest.length > 0 && <div className="lp-subtitle">{rest.join('\n')}</div>}
                  </>
                )
              })()}
              {year && <div className="lp-year">{year}</div>}
            </div>
          </>
        )}

        <div className="lp-body">
          {paragraphs.map((p, i) => (
            <p key={i} className={signoff && i === paragraphs.length - 1 ? 'lp-signoff' : undefined}>
              {p}
            </p>
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

  // maxPages search state: a binary search for the LARGEST body scale whose real
  // pagination still fits within `maxPages` sheets. `probe` is the scale the
  // measurement probes currently render at — they are KEYED by it so each step
  // remounts them, because a fresh mount resolves its container-query font before
  // the measurement runs (mutating the scale on a live element updates the
  // computed font but not the paragraph layout, so a re-read would be stale).
  // `lo` is the largest scale known to fit, `hi` the smallest known NOT to.
  const FIT_INIT = { lo: MAXPAGES_MIN_SCALE, hi: MAX_SCALE, probe: 1, settled: false }
  const [fit, setFit] = useState(FIT_INIT)
  // Async re-measures (font swap, resize, timeout) must read the CURRENT search
  // state, not the value captured when they were scheduled — a stale read would
  // pair one scale's measurement with another scale's bounds and corrupt the search.
  const fitRef = useRef(fit)
  fitRef.current = fit
  useEffect(() => {
    setFit(FIT_INIT) // restart the search whenever the body or the cap changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.body, props.maxPages])

  const startIndex = props.startIndex ?? 0
  const onPageCount = props.onPageCount
  // Report the sheet count up so a parent can keep the right/left alternation
  // running continuously into the next block (e.g. Message after Profile).
  useEffect(() => {
    onPageCount?.(plan.pages.length)
  }, [onPageCount, plan.pages.length])

  useLayoutEffect(() => {
    // `fonts.ready` is a promise, so its callback cannot be unsubscribed — without
    // this flag every superseded effect run would still re-enter measure() after
    // teardown, forcing a redundant synchronous layout of both probe sheets.
    let cancelled = false
    const measure = () => {
      if (cancelled) return
      // Fixed-size mode: render the whole body on ONE sheet at exactly `bodyFontCqw`
      // (no auto-fit search); the caller tightens `bodyLineHeight` so it still fits.
      if (props.bodyFontCqw != null) {
        setPlan({ pages: [paras], scale: props.bodyFontCqw / BASE_PARA_FS })
        return
      }
      const first = firstRef.current
      const cont = contRef.current
      if (!first || !cont) return
      const page = first.closest('.leader-page') as HTMLElement | null
      const pageH = page?.clientHeight ?? 0
      if (!pageH) return
      // Page-capped documents may use more of the sheet (they have to fit a fixed
      // number of pages, and filling them is the point); the default path keeps
      // the conservative band.
      const budget = pageH * (props.maxPages ? MAXPAGES_SAFE : SAFE)

      // The probes are keyed by fit.probe, so they render freshly at that scale
      // and their layout (positions AND heights) is exact — no cq staleness.
      const firstParas = Array.from(first.querySelectorAll<HTMLElement>('.lp-body p'))
      if (!firstParas.length) {
        setPlan({ pages: [paras], scale: fitRef.current.probe })
        return
      }

      // Continuation-sheet geometry (contRef probe: every paragraph, no header,
      // full width) at the current probe scale.
      const contParas = Array.from(cont.querySelectorAll<HTMLElement>('.lp-body p'))
      const contHeadH = contParas.length ? contParas[0].offsetTop : 0
      const contUsable = Math.max(budget - contHeadH, budget * 0.5)
      const paraH = (i: number) => {
        const el = contParas[i]
        if (!el) return 0
        const next = contParas[i + 1]
        return next ? next.offsetTop - el.offsetTop : el.offsetHeight
      }

      // Paginate at the CURRENT probe scale using the real measured layout: page 1
      // holds the leading paragraphs that fit under the photo/identity header
      // (firstParas positions, so the float is handled exactly), the rest pack
      // onto header-less continuation sheets (contParas heights).
      const paginate = (): string[][] => {
        let c1 = 0
        for (let i = 0; i < firstParas.length; i++) {
          if (firstParas[i].offsetTop + firstParas[i].offsetHeight > budget) break
          c1 = i + 1
        }
        const out: string[][] = [paras.slice(0, c1)]
        let cur: string[] = []
        let used = 0
        for (let i = c1; i < paras.length; i++) {
          const h = paraH(i)
          if (used + h > contUsable && cur.length) {
            out.push(cur)
            cur = []
            used = 0
          }
          cur.push(paras[i])
          used += h
        }
        if (cur.length) out.push(cur)
        return out
      }

      // Opt-in: fit the whole body onto at most `maxPages` sheets at the LARGEST
      // readable type. Each pass measures the real pagination at fit.probe, then
      // narrows a binary search (probes remount at the new scale and this effect
      // re-runs). Converges in ~7 passes to the biggest scale that still fits —
      // which both enlarges the type and fills the sheets. Only maxPages documents
      // iterate; everyone else stays at scale 1.
      if (props.maxPages && props.maxPages >= 1) {
        const pages = paginate()
        const fits = pages.length <= props.maxPages
        const cur = fitRef.current
        if (cur.settled) {
          // Final validation: only publish a plan whose page count is confirmed by
          // this measurement of the committed scale. If it doesn't hold, ease the
          // scale down and re-validate (self-correcting, so a transient bad read
          // during the search can never ship an over-long page).
          if (!fits && cur.probe > MAXPAGES_MIN_SCALE + 1e-9) {
            const next = Math.max(MAXPAGES_MIN_SCALE, Number((cur.probe - 0.02).toFixed(3)))
            setFit({ lo: MAXPAGES_MIN_SCALE, hi: cur.probe, probe: next, settled: true })
            return
          }
          setPlan({ pages, scale: cur.probe })
          return
        }
        const lo = fits ? Math.max(cur.lo, cur.probe) : cur.lo
        const hi = fits ? cur.hi : Math.min(cur.hi, cur.probe)
        if (hi - lo <= FIT_TOLERANCE) {
          // Converged: commit at `lo`, the largest scale known to fit; the settled
          // pass above re-measures at that scale and validates before publishing.
          setFit({ lo, hi, probe: lo, settled: true })
          return
        }
        setFit({ lo, hi, probe: Number(((lo + hi) / 2).toFixed(3)), settled: false })
        return
      }

      // Default path. `ratio` is how much the body could grow/shrink RELATIVE to
      // the scale the probes are currently rendered at.
      const bodyTop = firstParas[0].offsetTop
      const lastP = firstParas[firstParas.length - 1]
      const bodyBottom = lastP.offsetTop + lastP.offsetHeight
      const bodyH = bodyBottom - bodyTop
      const ratio = bodyH > 0 ? (budget - bodyTop) / bodyH : 1
      const cur = fitRef.current

      // Already probing a grown scale (> 1): this pass VALIDATES it. Growing is
      // only ~quadratic on average — each paragraph also gains or loses a whole
      // line to rounding, which no closed-form model predicts — so the grown size
      // is confirmed by measurement and eased down until the body really fits.
      if (cur.probe > 1 + 1e-9) {
        if (bodyBottom > budget) {
          const next = Math.max(1, Number((cur.probe - 0.03).toFixed(3)))
          setFit({ lo: 1, hi: cur.probe, probe: next, settled: true })
          return
        }
        setPlan({ pages: [paras], scale: cur.probe })
        return
      }

      // Probing at scale 1. Spare space (ratio ≥ 1) → grow into it: √ratio is the
      // first guess (height grows ≈ with scale²), trimmed by GROWTH_SLACK so the
      // guess usually validates on the first try, and capped at MAX_SCALE.
      // `hi < MAX_SCALE` means a grown scale was already tried and eased back to 1,
      // so don't guess again — that would loop.
      if (ratio >= 1) {
        const untried = cur.hi >= MAX_SCALE - 1e-9
        const guess = Math.min(MAX_SCALE, Math.sqrt(ratio * GROWTH_SLACK))
        if (untried && guess > 1.001) {
          setFit({ lo: 1, hi: MAX_SCALE, probe: Number(guess.toFixed(3)), settled: true })
          return
        }
        setPlan({ pages: [paras], scale: 1 })
        return
      }

      // Too long for one page at full size. A shrink reflows to FEWER lines, so
      // the real height is ≤ bodyH*ratio and the derived scale always fits.
      if (ratio >= ONE_PAGE_MIN_SCALE) {
        setPlan({ pages: [paras], scale: ratio })
        return
      }
      setPlan({ pages: paginate(), scale: 1 })
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
      cancelled = true
      window.removeEventListener('resize', onResize)
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [props.body, paras, props.maxPages, fit])

  return (
    <>
      {plan.pages.map((group, i) => (
        // Keyed by scale so a scale change REMOUNTS the sheet — a fresh mount
        // lays out the body at the new cq-based font size (a live mutation would
        // update the font but not re-flow the paragraphs).
        <LeaderSheet
          key={`${i}-${plan.scale}`}
          kind={props.kind}
          side={(startIndex + i) % 2 === 0 ? 'right' : 'left'}
          name={props.name}
          designation={props.designation}
          year={props.year}
          photo={props.photo}
          paragraphs={group}
          continuation={i > 0}
          scale={plan.scale}
          contentTop={props.contentTop}
          // A Message ends with its complimentary close, so the sign-off is the
          // last paragraph of the LAST sheet. Profiles have none.
          signoff={props.kind === 'message' && i === plan.pages.length - 1}
          bodyFontDeltaPx={props.bodyFontDeltaPx}
          bodyLineHeight={props.bodyLineHeight}
          photoVariant={props.photoVariant}
        />
      ))}

      {/* Hidden probes (all paragraphs) used only to measure the split. Keyed by
          fit.probe so each maxPages step remounts them at the new scale. */}
      <div
        className="no-print"
        aria-hidden
        style={{ position: 'absolute', left: -100000, top: 0, visibility: 'hidden', pointerEvents: 'none' }}
      >
        <LeaderSheet
          key={`first-${fit.probe}`}
          kind={props.kind}
          side="right"
          name={props.name}
          designation={props.designation}
          year={props.year}
          photo={props.photo}
          paragraphs={paras}
          scale={fit.probe}
          contentTop={props.contentTop}
          signoff={props.kind === 'message'}
          // Measure with the SAME photo frame the real sheet uses, so page-1
          // capacity (text wrapping beside/below the floated photo) is accurate.
          // Without this the probe used the default 28% frame and under-counted the
          // space a 46% couple photo takes, letting page 1 overflow under maxPages.
          photoVariant={props.photoVariant}
          contentRef={firstRef}
        />
        <LeaderSheet
          key={`cont-${fit.probe}`}
          kind={props.kind}
          side="right"
          name={props.name}
          designation={props.designation}
          year={props.year}
          photo={props.photo}
          paragraphs={paras}
          continuation
          scale={fit.probe}
          contentTop={props.contentTop}
          signoff={props.kind === 'message'}
          photoVariant={props.photoVariant}
          contentRef={contRef}
        />
      </div>
    </>
  )
}
