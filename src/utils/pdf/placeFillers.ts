import type { jsPDF } from 'jspdf'
import { bottomGapBox, type GapBox } from './placeAds'
import { PAGE_W_MM, PAGE_H_MM } from './captureToPdf'

// Fillers (Rotary quotes / mottos / graphics) fill the LEFTOVER empty bottom of content
// pages that did NOT receive an advertiser ad. Each library item is used AT MOST ONCE
// across the whole book (no repeats); the panel is rendered to fit the exact gap, so the
// SIZE follows the space left. Single source of truth = public/fillers/:
//   • content.json  — the item library (each entry once)
//   • render.js     — renderFiller(item, w, h, logos) → an SVG laid out to fit any w×h
//   • assets/*.png  — the Rotary logos (navy-on-light, white-on-dark)
// render.js is imported at RUNTIME (blob module) so this stays in sync with the preview
// instead of being a forked copy.

const RES = 4 // px per mm when rasterizing the filler SVG — crisp without being huge
// Fillers fit much smaller gaps than ads (client wants even short bottom bands filled):
// a short quote renders as a slim horizontal band. Ads keep their larger minimum so they
// are never cramped (see placeAds.tuckSmallAd).
export const FILLER_MIN_MM = 28

type FillerSize = 's' | 'm' | 'l'

interface FillerItem {
  id: string
  type: string
  theme: 'navy' | 'cream'
  pool: string
  verify: boolean
  /** Length tier: short quotes → small gaps, long quotes → big gaps. */
  size?: FillerSize
  [k: string]: unknown
}
type RenderFiller = (item: FillerItem, w: number, h: number, logos: { white: string; navy: string }) => string

export interface FillerQueue {
  /** Unused items, consumed front-to-back (verified/Rotary-official first). */
  items: FillerItem[]
  /** Immutable copy of the full library — a last-resort source for a full-page padding
   *  filler to REPEAT from once `items` is exhausted, so a padding page is never left blank. */
  all: FillerItem[]
  logos: { white: string; navy: string }
  render: RenderFiller
  /** Optional embedded @font-face CSS (base64 woff2) injected into each SVG so the
   *  rasterizer renders Petrona/Geist exactly instead of the Georgia/Arial fallback. */
  fontCSS?: string
}

async function toDataUrl(src: string): Promise<string> {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`filler asset fetch failed ${src} (${res.status})`)
  const blob = await res.blob()
  return await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
}

/**
 * Load the filler content, logos (base64) and the renderer. Returns null on ANY failure —
 * fillers are optional page decoration and must never break the export.
 */
export async function loadFillerQueue(fontCSS?: string): Promise<FillerQueue | null> {
  try {
    const [content, white, navy, renderSrc] = await Promise.all([
      (await fetch('/fillers/content.json')).json(),
      toDataUrl('/fillers/assets/rotary-white.png'),
      toDataUrl('/fillers/assets/rotary-masterbrand.png'),
      (await fetch('/fillers/render.js')).text(),
    ])
    const all: FillerItem[] = Array.isArray(content?.items) ? content.items : []
    if (!all.length) return null
    // Verified / Rotary-official items (verify:false) first so the safest content is most
    // likely to appear; keep content.json order (it alternates navy/cream) within a group.
    const items = [...all].sort((a, b) => Number(a.verify) - Number(b.verify))
    // Import render.js as a runtime blob module (single source of truth shared with the
    // preview; not bundled). @vite-ignore keeps Vite from trying to resolve the URL.
    const blobUrl = URL.createObjectURL(new Blob([renderSrc], { type: 'text/javascript' }))
    let render: RenderFiller | undefined
    try {
      const mod = await import(/* @vite-ignore */ blobUrl)
      render = mod.renderFiller as RenderFiller
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
    if (typeof render !== 'function') return null
    return { items, all: [...items], logos: { white, navy }, render, fontCSS }
  } catch (e) {
    console.warn('[fillers] disabled — load failed', e)
    return null
  }
}

/** Rasterize a filler SVG string to a PNG data URL at the given pixel size. */
async function rasterizeSvg(svg: string, wPx: number, hPx: number): Promise<string | null> {
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('filler svg load failed'))
      image.src = blobUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = wPx
    canvas.height = hPx
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(image, 0, 0, wPx, hPx)
    return canvas.toDataURL('image/png')
  } catch (e) {
    console.warn('[fillers] rasterize failed', e)
    return null
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

// The @import line render.js puts in every SVG — replaced with embedded @font-face CSS
// (if available) because an SVG rasterized via <img> cannot fetch an @import stylesheet.
const FONT_IMPORT_RE = /@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);/

/**
 * Pick (and REMOVE) the unused filler that best fits a gap of height `hMm`: a short quote
 * for a small gap, a long quote for a big gap. Falls back to the nearest available tier so
 * a gap is still filled when the ideal tier is exhausted (items are pre-sorted so the
 * verified/Rotary-official ones in each tier come first). Returns undefined if empty.
 */
function pickForGap(items: FillerItem[], hMm: number): FillerItem | undefined {
  const tier: FillerSize = hMm >= 108 ? 'l' : hMm >= 74 ? 'm' : 's'
  const order: FillerSize[] = tier === 's' ? ['s', 'm', 'l'] : tier === 'm' ? ['m', 's', 'l'] : ['l', 'm', 's']
  for (const t of order) {
    const i = items.findIndex((it) => (it.size || 'm') === t)
    if (i >= 0) return items.splice(i, 1)[0]
  }
  return items.shift()
}

/**
 * If the just-drawn content sheet has a large empty bottom (≥ FILLER_MIN_MM) and no ad was
 * tucked there, render the next unused filler to fit that gap and draw it onto the CURRENT
 * pdf page. Consumes exactly one item (never repeats). Returns true if a filler was placed.
 * Any failure (no gap, library empty, render/rasterize error) is a silent no-op.
 */
export async function tuckFiller(pdf: jsPDF, canvas: HTMLCanvasElement, q: FillerQueue): Promise<boolean> {
  if (!q.items.length) return false
  const box = bottomGapBox(canvas)
  if (!box || box.h < FILLER_MIN_MM) return false
  return drawFillerInBox(pdf, box, q)
}

/**
 * Render the next unused filler to fit an EXPLICIT box (mm) and draw it there. Consumes one
 * item (never repeats). Used both for a whole bottom gap (via tuckFiller) and for the right
 * half of a quarter-ad gap (quarter ad + filler = half page). Caller gates the minimum size.
 */
export async function drawFillerInBox(pdf: jsPDF, box: GapBox, q: FillerQueue): Promise<boolean> {
  if (!q.items.length) return false
  // Size-match the quote to the gap: short→small space, long→big space (client's rule).
  const item = pickForGap(q.items, box.h)
  if (!item) return false
  return renderItemInBox(pdf, box, item, q)
}

/** Render ONE given filler item into a box (rasterize its SVG → addImage). No queue
 *  bookkeeping — the caller decides whether the item was consumed or repeated. */
async function renderItemInBox(pdf: jsPDF, box: GapBox, item: FillerItem, q: FillerQueue): Promise<boolean> {
  const wPx = Math.round(box.w * RES)
  const hPx = Math.round(box.h * RES)
  let svg: string
  try {
    svg = q.render(item, wPx, hPx, q.logos)
  } catch (e) {
    console.warn('[fillers] render failed', item.id, e)
    return false
  }
  if (q.fontCSS) svg = svg.replace(FONT_IMPORT_RE, q.fontCSS)
  const dataUrl = await rasterizeSvg(svg, wPx, hPx)
  if (!dataUrl) return false
  pdf.addImage(dataUrl, 'PNG', box.x, box.y, box.w, box.h)
  return true
}

// A full-page filler (a framed quote "card") replaces what would otherwise be a BLANK
// recto-padding page when the full-page ads run out — so the book never has a blank page.
// The box is near page-shape (aspect ≈ 0.75) so render.js lays it out in its portrait
// "tall" mode: logo on top, auto-fit quote centered, author + gold frame.
const FULL_FILLER_SIDE_MM = 16
const FULL_FILLER_TOPBOT_MM = 20
let fullFillerSeq = 0 // rotates repeats (once the fresh pool is spent) so they vary

/**
 * Draw a full-page filler onto the CURRENT pdf page (the caller has already started the page,
 * e.g. via addBlankPage). Consumes a fresh, never-repeated item when one is left; otherwise
 * REPEATS one from the full library so a padding page is NEVER left blank. Returns false only
 * if the library is entirely empty (no fillers at all).
 */
export async function drawFullPageFiller(pdf: jsPDF, q: FillerQueue): Promise<boolean> {
  const box: GapBox = {
    x: FULL_FILLER_SIDE_MM,
    y: FULL_FILLER_TOPBOT_MM,
    w: PAGE_W_MM - 2 * FULL_FILLER_SIDE_MM,
    h: PAGE_H_MM - 2 * FULL_FILLER_TOPBOT_MM,
  }
  if (q.items.length) {
    const item = pickForGap(q.items, box.h)
    if (item) return renderItemInBox(pdf, box, item, q)
  }
  if (!q.all.length) return false
  const item = q.all[fullFillerSeq++ % q.all.length]
  return renderItemInBox(pdf, box, item, q)
}
