import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'

// B5-ish page matching the Border.svg artwork (viewBox 527.24 × 697.32).
export const PAGE_W_MM = 186
export const PAGE_H_MM = 246

// Photo hosts send no CORS headers, so the capture can't fetch them cross-origin.
// Route them through a same-origin dev proxy so they can be fetched + inlined as
// base64: the API's own image host via /rzapi (where photos now live), and the
// legacy rotaryindia.org mirror via /imgproxy (kept as a fallback).
function toProxied(url: string): string {
  if (!url || url.startsWith('data:')) return url
  return url
    .replace(/^https?:\/\/rizones45678\.org\/API/i, '/rzapi')
    .replace(/^https?:\/\/rotaryindia\.org/i, '/imgproxy')
}

// 1×1 transparent GIF. Used to blank any photo we can't inline, so a broken/
// cross-origin <img> never reaches the capture canvas (see inlineImages).
const BLANK_PX =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// True for sources that are safe to draw to a canvas without tainting it:
// same-origin assets (bundled photos, frame SVGs), data:/blob: URLs, and any
// relative/unparseable path (which resolves same-origin).
function isSafeSrc(src: string): boolean {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return true
  try {
    return new URL(src, location.href).origin === location.origin
  } catch {
    return true
  }
}

async function fetchAsDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = () => resolve('')
      r.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Minimal font embed (perf-critical). html-to-image's default auto-embed scans
// EVERY document stylesheet for @font-face and inlines EVERY family as base64 into
// EACH sheet's foreignObject — index.html loads ~10 Google families at 100..900,
// so that is ~2 MB of work per sheet and grinds a multi-sheet export to a halt
// (the combined "Download All" would stall partway). Instead we pre-build a tiny
// embed for ONLY the families a given export actually uses (e.g. the directory =
// Petrona + Geist), ONCE, and pass it to every `toCanvas` — the library then skips
// its expensive scan entirely and just reuses our string. Same fonts render, so
// the design is unchanged; only the wasted per-sheet work is removed.
// ---------------------------------------------------------------------------
const fontEmbedCache = new Map<string, Promise<string | undefined>>()
const FONT_URL_RE = /url\((https:\/\/[^)]+\.woff2?)\)/g

/**
 * Build (and memoize) a `fontEmbedCSS` string covering only `families`, with every
 * font file inlined as base64 so the capture is self-contained. Fetches the Google
 * Fonts css2 for those families (variable 100..900), then inlines each woff2. On any
 * failure returns `undefined`, so callers transparently fall back to the library's
 * auto-embed (correct output, just slow) rather than breaking the export.
 */
export function buildFontEmbedCSS(families: string[]): Promise<string | undefined> {
  const key = [...families].sort().join('|')
  const cached = fontEmbedCache.get(key)
  if (cached) return cached
  const p = (async () => {
    try {
      const q = families
        .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@100..900`)
        .join('&')
      const cssUrl = `https://fonts.googleapis.com/css2?${q}&display=swap`
      const css = await (await fetch(cssUrl)).text()
      const urls = [...new Set([...css.matchAll(FONT_URL_RE)].map((m) => m[1]))]
      const inlined = new Map<string, string>()
      await Promise.all(
        urls.map(async (u) => {
          const d = await fetchAsDataUrl(u)
          if (d) inlined.set(u, d)
        }),
      )
      // If nothing inlined, the string would still reference cross-origin URLs the
      // capture can't fetch — treat that as a failure and fall back to auto-embed.
      if (!inlined.size) return undefined
      return css.replace(FONT_URL_RE, (m, u) => (inlined.has(u) ? `url(${inlined.get(u)})` : m))
    } catch {
      return undefined
    }
  })()
  fontEmbedCache.set(key, p)
  return p
}

/** Replace cross-origin <img> sources with inlined base64 so the capture can
 *  embed them without tainting the canvas. Same-origin assets (the frame SVGs,
 *  the bundled dummy photo) are left untouched.
 *
 *  Crucial for the bulk export: if a photo can't be inlined (the file 404s on the
 *  origin, or the host sends no CORS headers), we must NOT leave the cross-origin
 *  URL on the element — a single broken/tainted <img> makes `toCanvas` throw a
 *  SecurityError, which previously aborted the entire multi-hundred-page export.
 *  Instead we blank it to a transparent pixel, so the card's own silhouette
 *  placeholder shows through exactly as it does on-screen and the capture always
 *  succeeds. Every non-same-origin host is inlined (not just rotaryindia.org). */
export async function inlineImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  // SVG <image> tiles (the My Journey curved-collage mosaic). toCanvas serializes the
  // sheet into a data-URL SVG, and a data-URL SVG cannot load external resources — even
  // same-origin ones — so any href left as a URL would rasterize BLANK. Inline every SVG
  // image href (the /journey/* assets are same-origin) as base64 so they render. No-op
  // for card sheets, which have no SVG <image> elements.
  const svgImages = Array.from(root.querySelectorAll('image')) as SVGImageElement[]
  await Promise.all([
    ...imgs.map(async (img) => {
      const src = img.getAttribute('src') || ''
      if (isSafeSrc(src)) return // same-origin / data: / blob: → safe as-is
      const dataUrl = await fetchAsDataUrl(toProxied(src))
      img.setAttribute('src', dataUrl || BLANK_PX)
    }),
    ...svgImages.map(async (im) => {
      const href = im.getAttribute('href') || im.getAttribute('xlink:href') || ''
      if (!href || href.startsWith('data:')) return
      const dataUrl = await fetchAsDataUrl(toProxied(href))
      if (dataUrl) {
        im.setAttribute('href', dataUrl)
        im.removeAttribute('xlink:href')
      }
    }),
  ])
}

// PERF: html-to-image renders the page-frame SVGs natively, but they're large
// (~2MB each, with an embedded raster watermark). Inlining 2MB of base64 into
// every one of 100+ sheets is slow/heavy, so pre-rasterize each frame to a
// compact PNG ONCE (cached, since right/left repeat across every sheet) and swap
// it in. The bulk capture is raster either way, so this is visually identical.
const FRAME_VB = { w: 527.24, h: 697.32 } // border-*.svg viewBox
const pngCache = new Map<string, Promise<string>>()

function svgUrlToPng(url: string, scale = 3): Promise<string> {
  let p = pngCache.get(url)
  if (p) return p
  p = (async () => {
    const txt = await (await fetch(url)).text()
    const w = Math.round(FRAME_VB.w * scale)
    const h = Math.round(FRAME_VB.h * scale)
    // The asset only carries a viewBox; force explicit dimensions so it rasterizes
    // at full page size instead of its tiny intrinsic size.
    const patched = txt.replace(/<svg\b/, `<svg width="${w}" height="${h}"`)
    const blobUrl = URL.createObjectURL(new Blob([patched], { type: 'image/svg+xml' }))
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('frame svg load failed'))
        img.src = blobUrl
      })
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      return canvas.toDataURL('image/png')
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  })()
  pngCache.set(url, p)
  return p
}

/** Swap each page-frame SVG background (`.dir-bg` / `.lp-bg` / `.ref-bg`) for a
 *  cached, rasterized PNG to keep the capture light. No-op for already-inlined
 *  sources. (`.ref-bg` uses the same border-*.svg as `.lp-bg`, so it shares the
 *  per-URL cache.) */
export async function rasterizeBackgrounds(root: HTMLElement): Promise<void> {
  const bgs = Array.from(root.querySelectorAll('.dir-bg, .lp-bg, .ref-bg')) as HTMLImageElement[]
  await Promise.all(
    bgs.map(async (img) => {
      const src = img.getAttribute('src') || ''
      if (!src || !src.endsWith('.svg')) return
      try {
        img.src = await svgUrlToPng(src)
      } catch {
        /* leave the SVG in place if rasterization fails */
      }
    }),
  )
}

/** Resolve once every <img> in the subtree has finished loading (or errored). */
export async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve()
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
          setTimeout(resolve, 8000)
        }),
    ),
  )
}

// Every framed B5 sheet variant we capture: directory sheets, leader (profile /
// message) sheets, and the static reference sheets.
const SHEET_SELECTOR = '.dir-sheet, .leader-page, .ref-page'

/** A fresh, empty PDF sized to the Border.svg artwork. jsPDF opens with ONE blank
 *  page already present; the first sheet appended by {@link appendSheetsToPdf}
 *  draws onto it, so there is no leading blank page. */
export function newSheetPdf(): jsPDF {
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE_W_MM, PAGE_H_MM] })
}

/** Append one intentionally-blank B5 page (jsPDF pages are white by default), keeping
 *  `state.drawn` — the running page count — in sync. Used to push a recto opener onto
 *  a right-hand page when it would otherwise fall on a left-hand (verso) page. */
export function addBlankPage(pdf: jsPDF, state: { drawn: number }): void {
  if (state.drawn > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], 'portrait')
  state.drawn++
}

/** Rasterize every B5 sheet in `root` and APPEND each as a page to `pdf`, tracking
 *  the running page count in `state.drawn` so several documents — each rendered and
 *  torn down on its own off-screen host — accumulate into ONE combined PDF (the
 *  first sheet lands on jsPDF's initial blank page; every later sheet adds one).
 *
 *  Uses html-to-image (DOM → SVG <foreignObject> → canvas), which renders with the
 *  BROWSER'S native engine — exactly like the individual "Download PDF"
 *  (window.print). So the bulk output stays identical to the on-screen design:
 *  clipped/ellipsised values, the SVG page frame, and grid alignment all match.
 *  (html2canvas re-implements CSS and diverged — dropped the SVG frame and garbled
 *  clipped text — so it produced a different, broken design.)
 *
 *  FONTS: pass a MINIMAL, precomputed `fontEmbedCSS` (see {@link buildFontEmbedCSS})
 *  covering only the families this export uses. Do NOT let html-to-image auto-embed
 *  (the default when this is omitted): it re-scans all stylesheets and inlines all
 *  ~10 Google families as base64 into every sheet, which stalls a big combined
 *  export. When `fontEmbedCSS` is undefined we fall back to that auto-embed — correct
 *  but slow — so a font-fetch failure never breaks the export. */
export async function appendSheetsToPdf(
  root: HTMLElement,
  pdf: jsPDF,
  state: { drawn: number },
  fontEmbedCSS?: string,
  onSheet?: (done: number, total: number) => void,
  onSheetDrawn?: (canvas: HTMLCanvasElement) => void | Promise<void>,
): Promise<void> {
  // Capture only the real, visible sheets — never the hidden measurement probes that
  // share the sheet class (ReferencePage's `.ref-page.ref-probe`, and LeaderPage's
  // probe sheets nested in a `.no-print`/`[aria-hidden]` wrapper). Rasterizing those
  // would add duplicate/blank pages and roughly triple the work per document.
  const sheets = (Array.from(root.querySelectorAll(SHEET_SELECTOR)) as HTMLElement[]).filter(
    (el) => !el.closest('.ref-probe, .no-print, [aria-hidden="true"]'),
  )
  for (let idx = 0; idx < sheets.length; idx++) {
    const sheet = sheets[idx]
    // Report before capturing so the progress UI advances per SHEET, not per document.
    // Several documents (the 52-sheet club book, the large committees) hold dozens of
    // sheets, so a per-document bar sits motionless for a minute at a time and looks
    // frozen — the single most common reason a user aborts the export before it saves.
    onSheet?.(idx, sheets.length)
    // html-to-image's `backgroundColor` REPLACES the captured node's own background
    // (its applyStyle sets the clone root's background-color to this value, and it also
    // fills the canvas with it). Hardcoding white here erased each sheet's per-SECTION
    // tint, so every page came out uniformly white even though the member cards (child
    // nodes, which are not overridden) kept their colour. Use the sheet's OWN computed
    // background so the page carries its section tint; fall back to white only if the
    // sheet is somehow transparent (never the case for a framed B5 sheet, which is opaque).
    let sheetBg = getComputedStyle(sheet).backgroundColor
    if (!sheetBg || sheetBg === 'transparent' || sheetBg === 'rgba(0, 0, 0, 0)') sheetBg = '#ffffff'
    let canvas: HTMLCanvasElement
    try {
      canvas = await toCanvas(sheet, {
        pixelRatio: 2,
        backgroundColor: sheetBg,
        ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
      })
    } catch (err) {
      // A single un-capturable sheet must not abort the whole combined export
      // (inlineImages already blanks un-inlinable photos, so this is a last resort).
      // Skip it, keep the running PDF, and log which sheet failed.
      console.warn('[pdf] sheet capture failed — skipping this sheet', err)
      continue
    }
    const img = canvas.toDataURL('image/jpeg', 0.92)
    if (state.drawn > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], 'portrait')
    pdf.addImage(img, 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM)
    state.drawn++
    // Let the caller overlay something onto the page just drawn (the master export tucks
    // a half/quarter ad OR a filler into a content page's empty bottom, measured from this
    // canvas). Awaited: the filler overlay rasterizes an SVG asynchronously, and it must
    // finish drawing onto THIS page before the loop adds the next one.
    await onSheetDrawn?.(canvas)
  }
}

/** Rasterize every B5 sheet in the subtree into a single multi-page PDF Blob.
 *  Returns null if the subtree has no sheets. Pass a precomputed `fontEmbedCSS`
 *  (see {@link buildFontEmbedCSS}) so a many-sheet section doesn't stall re-embedding
 *  every font family on every sheet. */
export async function sheetsToPdfBlob(root: HTMLElement, fontEmbedCSS?: string): Promise<Blob | null> {
  const pdf = newSheetPdf()
  const state = { drawn: 0 }
  await appendSheetsToPdf(root, pdf, state, fontEmbedCSS)
  return state.drawn ? pdf.output('blob') : null
}
