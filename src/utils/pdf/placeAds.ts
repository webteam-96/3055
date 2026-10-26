import type { jsPDF } from 'jspdf'
import { PAGE_W_MM, PAGE_H_MM } from './captureToPdf'
import { FULL_ADS, OVERFLOW_FULL_ADS, HALF_ADS, QUARTER_ADS, FEATURE_ADS, PAIR_ADS, BACK_COVER_AD, type Ad } from '../../data/advertisements'

// Advertiser ads placed into the home "Download Everything" master PDF:
//   • full-page ads fill the blank recto-padding pages (the pages otherwise left blank
//     to push a section onto a right-hand page);
//   • half / quarter ads are TUCKED into the empty bottom of content pages (a page whose
//     content starts at the top and leaves a large/medium empty area at the bottom) —
//     detected from the rasterized sheet canvas. Big gap ⇒ half ad, smaller gap ⇒ quarter;
//   • any half/quarter ads that didn't find a gap are appended two-up at the end;
//   • the "half + half = full" pair stacks on one appended page; the back cover is last.
// Images live in public/ads/ (bundled from the client's Directory Advertisements folder);
// see src/data/advertisements.ts for the ordered manifest.

const MM_PER_PT = 25.4 / 72
const M = +(12 * MM_PER_PT).toFixed(3) // ≈4.23mm — thin, even full-page border
const M_DARK = +(6 * MM_PER_PT).toFixed(3) // ≈2.12mm — tighter border for dark-background ads
const M_TIGHT = +(4 * MM_PER_PT).toFixed(3) // ≈1.41mm — minimal side border for full-width ads
// Ads placed with only a minimal border so they fill the page edge-to-edge (see drawFullAdPage).
const TIGHT_BORDER_ADS = new Set<string>(['/ads/rotary-ad-landscape.png', '/ads/riya-heart.png'])
// Full-page LANDSCAPE ads ROTATED 90° at load so they fill a PORTRAIT page instead of sitting as
// a wide strip with big empty top/bottom bands. St John's School (aspect ~1.26) and Riya Heart &
// Medical Hospital (aspect ~1.32) are both full-page landscape artwork; fit to the portrait page
// width they filled only ~60% of the height and read as half pages. Rotated, the long edge runs
// down the page so each fills it almost edge-to-edge (rotated aspect ≈ the page's 0.756), and the
// reader turns the book 90° to view it. Keyed by src so the rotation follows the ad.
const ROTATE_ADS = new Set<string>(['/ads/rotary-ad-landscape.png', '/ads/riya-heart.png'])
// Ads whose own artwork is on a black/dark panel: a tall-narrow one (e.g. Mehul Patel /
// MAD WORLD, aspect ~0.56) is height-limited on a full page and leaves wide CREAM side
// margins, so the dark panel looks off-centre. For these we fill the whole page black
// (the side gaps become black too ⇒ the ad blends edge-to-edge) and use a tighter border.
// Keyed by the ad's src so it follows the ad wherever it is placed, in any export.
const DARK_BG_ADS = new Set<string>(['/ads/mehul-patel.png'])
// Tuck-in geometry (calibrated from the client's red-box markups):
const SIDE = +(20 * MM_PER_PT).toFixed(3) // ≈7.06mm side margins, inside the page frame
const BOTTOM = +(72 * MM_PER_PT).toFixed(3) // ≈25.4mm up from the page bottom — clears the footer swoosh
const TOP_GAP = +(10 * MM_PER_PT).toFixed(3) // ≈3.53mm below the page's own content
const HALF_MIN_MM = 70 // empty box this tall or more ⇒ a half-page gap: a tucked ad fits well
const MIN_GAP_MM = 16 // smallest empty bottom worth reporting at all (below this ⇒ not a usable gap)
const GAP = 6 // mm between two stacked ads on an appended two-up page
const QUARTER_GUTTER = +(10 * MM_PER_PT).toFixed(3) // ≈3.53mm gutter between a quarter ad and its filler
const STACK_GUTTER = +(10 * MM_PER_PT).toFixed(3) // ≈3.53mm gutter between a bottom-aligned half ad and the filler above it

/** Minimum empty-bottom height (mm) for a tucked advertisement — a half-page gap. Below this
 *  the space goes to a filler instead (fillers fit much smaller bands). */
export const GAP_AD_MIN_MM = HALF_MIN_MM

export interface LoadedAd {
  dataUrl: string
  aspect: number
  /** Fill the page black behind this ad and use a tighter border (see DARK_BG_ADS). */
  darkBg?: boolean
  /** Use a minimal side border so this ad spans the full page width (see TIGHT_BORDER_ADS). */
  tightBorder?: boolean
}

async function toDataUrl(src: string): Promise<string> {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`ad fetch failed ${src} (${res.status})`)
  const blob = await res.blob()
  return await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
}

/** Rotate a PNG data URL 90° counter-clockwise (the reader turns the book clockwise to read
 *  it), returning the rotated data URL and its NEW width/height aspect. A landscape banner
 *  becomes a portrait image that fills a portrait page. Falls back to the original on failure. */
async function rotate90(dataUrl: string, origAspect: number): Promise<{ dataUrl: string; aspect: number }> {
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('rotate load failed'))
      img.src = dataUrl
    })
    const w = img.naturalWidth
    const h = img.naturalHeight
    const canvas = document.createElement('canvas')
    canvas.width = h // rotated: the old HEIGHT becomes the new WIDTH
    canvas.height = w
    const ctx = canvas.getContext('2d')
    if (!ctx) return { dataUrl, aspect: origAspect }
    // 90° counter-clockwise: move the origin to the new bottom-left, then rotate −90°.
    ctx.translate(0, canvas.height)
    ctx.rotate(-Math.PI / 2)
    ctx.drawImage(img, 0, 0)
    return { dataUrl: canvas.toDataURL('image/png'), aspect: canvas.width / canvas.height }
  } catch {
    return { dataUrl, aspect: origAspect }
  }
}

async function load(ad: Ad): Promise<LoadedAd | null> {
  try {
    let dataUrl = await toDataUrl(ad.src)
    let aspect = ad.aspect
    // Rotate a full-page landscape banner to portrait so it fills the page (see ROTATE_ADS).
    if (ROTATE_ADS.has(ad.src)) {
      const r = await rotate90(dataUrl, aspect)
      dataUrl = r.dataUrl
      aspect = r.aspect
    }
    return {
      dataUrl,
      aspect,
      darkBg: DARK_BG_ADS.has(ad.src),
      tightBorder: TIGHT_BORDER_ADS.has(ad.src),
    }
  } catch (e) {
    // A missing/unreadable ad must never break the whole export — skip it.
    console.warn('[ads] skipping ad', ad.src, e)
    return null
  }
}

export interface AdBundle {
  /** Full ads for the blank recto pages, then any leftover as their own pages. */
  blankPool: LoadedAd[]
  /** Feature ads — placed full-width on a tall content-page gap; leftovers get own page. */
  feature: LoadedAd[]
  /** Half-page ads — consumed by the tuck-in overlay (big gaps), leftovers appended two-up. */
  half: LoadedAd[]
  /** Quarter-page ads — consumed by the tuck-in overlay (medium gaps), leftovers two-up. */
  quarter: LoadedAd[]
  /** The half+half pair, stacked on one appended page. */
  pair: LoadedAd[]
  /** Back cover — the last page. */
  back: LoadedAd | null
}

/** Fetch + base64-encode every ad once, before the export loop. */
export async function loadAdBundle(): Promise<AdBundle> {
  const [full, overflow, feature, half, quarter, pair, back] = await Promise.all([
    Promise.all(FULL_ADS.map(load)),
    Promise.all(OVERFLOW_FULL_ADS.map(load)),
    Promise.all(FEATURE_ADS.map(load)),
    Promise.all(HALF_ADS.map(load)),
    Promise.all(QUARTER_ADS.map(load)),
    Promise.all(PAIR_ADS.map(load)),
    load(BACK_COVER_AD),
  ])
  const keep = (xs: (LoadedAd | null)[]) => xs.filter((x): x is LoadedAd => x !== null)
  return {
    blankPool: [...keep(full), ...keep(overflow)],
    feature: keep(feature),
    half: keep(half),
    quarter: keep(quarter),
    pair: keep(pair),
    back,
  }
}

/** Centered fit of `aspect` (w/h) into the box (x,y,bw,bh); all in mm. */
function fitBox(x: number, y: number, bw: number, bh: number, aspect: number) {
  let w = bw
  let h = w / aspect
  if (h > bh) {
    h = bh
    w = h * aspect
  }
  return { x: x + (bw - w) / 2, y: y + (bh - h) / 2, w, h }
}

function startPage(pdf: jsPDF, state: { drawn: number }) {
  // The first sheet lands on jsPDF's initial blank page; every later page adds one —
  // identical bookkeeping to appendSheetsToPdf/addBlankPage so page counts stay in sync.
  if (state.drawn > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], 'portrait')
  state.drawn++
}

/** One full-page ad with a thin even margin. Used to replace a blank recto page and for
 *  leftover full ads + the back cover. */
export function drawFullAdPage(pdf: jsPDF, state: { drawn: number }, ad: LoadedAd): void {
  startPage(pdf, state)
  // Dark-background ads: paint the whole page black edge-to-edge first, so the cream
  // side gaps left by a tall-narrow image disappear and the ad reads as deliberate; then
  // place the image with a tighter border so it sits closer to the page edges.
  const m = ad.darkBg ? M_DARK : ad.tightBorder ? M_TIGHT : M
  if (ad.darkBg) {
    pdf.setFillColor(0, 0, 0)
    pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, 'F')
  }
  const b = fitBox(m, m, PAGE_W_MM - 2 * m, PAGE_H_MM - 2 * m, ad.aspect)
  pdf.addImage(ad.dataUrl, 'PNG', b.x, b.y, b.w, b.h)
}

/**
 * Draw two ads stacked (top + bottom), each fit into its half, on a NEW page — a "half + half
 * = full" pair page. The bottom ad is optional (a lone ad fills just the top half). Used for
 * the appended two-up pages AND to fill an otherwise-blank/filler recto-padding page with a
 * real pair ad (see downloadCombinedPdf).
 */
export function drawPairPage(pdf: jsPDF, state: { drawn: number }, top: LoadedAd, bottom?: LoadedAd): void {
  const slotH = (PAGE_H_MM - 2 * M - GAP) / 2
  const bw = PAGE_W_MM - 2 * M
  startPage(pdf, state)
  const t = fitBox(M, M, bw, slotH, top.aspect)
  pdf.addImage(top.dataUrl, 'PNG', t.x, t.y, t.w, t.h)
  if (bottom) {
    const b = fitBox(M, M + slotH + GAP, bw, slotH, bottom.aspect)
    pdf.addImage(bottom.dataUrl, 'PNG', b.x, b.y, b.w, b.h)
  }
}

/** Append pages carrying up to two ads stacked (top + bottom), each fit into its half. */
export function appendTwoUp(pdf: jsPDF, state: { drawn: number }, ads: LoadedAd[]): void {
  for (let i = 0; i < ads.length; i += 2) drawPairPage(pdf, state, ads[i], ads[i + 1])
}

/**
 * Measure where the real content (dark ink — text, photos, logos) begins and ends on a
 * rasterized sheet, as fractions of page height. Ignores the outer frame band, the light
 * section TINT and the faint cityscape watermark (both above the dark threshold), and the
 * bottom ~12% where the footer swoosh lives — so a "content at top, empty at bottom" page
 * reports a small contentTop and a contentBottom well above 1.
 */
function analyzeContent(canvas: HTMLCanvasElement): { contentTopFrac: number; contentBottomFrac: number; darkFrac: number } | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const W = canvas.width
  const H = canvas.height
  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, W, H).data
  } catch {
    // Tainted canvas (shouldn't happen — images are inlined as base64) → skip overlay.
    return null
  }
  const x0 = Math.floor(W * 0.08)
  const x1 = Math.ceil(W * 0.92)
  const y0 = Math.floor(H * 0.06)
  const y1 = Math.ceil(H * 0.88) // ignore the footer swoosh region at the very bottom
  const step = 2
  const rowMin = Math.max(2, Math.round(((x1 - x0) / step) * 0.015))
  let top = -1
  let bot = -1
  let dark = 0
  let tot = 0
  for (let y = y0; y < y1; y += step) {
    let rowDark = 0
    for (let x = x0; x < x1; x += step) {
      const o = (y * W + x) * 4
      const L = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
      tot++
      if (L < 150) {
        dark++
        rowDark++
      }
    }
    if (rowDark > rowMin) {
      if (top < 0) top = y
      bot = y
    }
  }
  return {
    contentTopFrac: top < 0 ? 1 : top / H,
    contentBottomFrac: bot < 0 ? 0 : bot / H,
    darkFrac: tot ? dark / tot : 0,
  }
}

export interface GapBox {
  /** left edge, mm */
  x: number
  /** top edge, mm */
  y: number
  /** width, mm */
  w: number
  /** height, mm */
  h: number
}

/**
 * The empty-bottom rectangle (mm, inside the page frame and above the footer swoosh) on a
 * content sheet that is a candidate for a tucked ad OR filler — or null when the page is a
 * title/filler page (content centered, not top-aligned), essentially blank, or a full page
 * with no usable bottom gap. Shared by {@link tuckSmallAd} and the filler overlay so both
 * measure the leftover space identically. The size floor here is intentionally SMALL
 * (MIN_GAP_MM): each caller applies its own minimum — ads need a comfortable gap
 * (QUARTER_MIN_MM), fillers can use much smaller ones.
 */
export function bottomGapBox(canvas: HTMLCanvasElement): GapBox | null {
  const a = analyzeContent(canvas)
  if (!a) return null
  if (a.contentTopFrac > 0.2) return null // centered content ⇒ title/filler page
  if (a.darkFrac < 0.004) return null // essentially blank
  const boxTop = a.contentBottomFrac * PAGE_H_MM + TOP_GAP
  const boxBot = PAGE_H_MM - BOTTOM
  const h = boxBot - boxTop
  if (h < MIN_GAP_MM) return null
  return { x: SIDE, y: boxTop, w: PAGE_W_MM - 2 * SIDE, h }
}

/** A single tuck-in advertisement unit: a half-page ad (fills the whole gap) or a quarter
 *  ad (fills HALF the gap; a filler fills the other half). */
export interface AdUnit {
  kind: 'half' | 'quarter'
  ad: LoadedAd
}

/**
 * Order the tuck-in ads into a single sequence that SPREADS the quarter ad(s) evenly among
 * the half ads, so both types distribute through the book instead of clustering by type.
 * e.g. 4 halves + 1 quarter ⇒ [half, half, quarter, half, half].
 */
export function buildAdUnits(half: LoadedAd[], quarter: LoadedAd[]): AdUnit[] {
  const H = half.length
  const Q = quarter.length
  const N = H + Q
  if (!N) return []
  // Evenly-spaced slot indices (within N) that should hold a quarter ad.
  const qSlots = new Set<number>()
  for (let i = 0; i < Q; i++) qSlots.add(Math.floor(((i + 0.5) * N) / Q))
  const out: AdUnit[] = []
  let hi = 0
  let qi = 0
  for (let k = 0; k < N; k++) {
    if (qSlots.has(k) && qi < Q) out.push({ kind: 'quarter', ad: quarter[qi++] })
    else if (hi < H) out.push({ kind: 'half', ad: half[hi++] })
    else if (qi < Q) out.push({ kind: 'quarter', ad: quarter[qi++] })
  }
  return out
}

/** Draw an ad centered (aspect-preserving) inside the given box; used for a half ad (whole
 *  gap) and a quarter ad (left half of the gap). */
export function drawAdInBox(pdf: jsPDF, box: GapBox, ad: LoadedAd): void {
  const b = fitBox(box.x, box.y, box.w, box.h, ad.aspect)
  pdf.addImage(ad.dataUrl, 'PNG', b.x, b.y, b.w, b.h)
}

/** Split a half-page gap into a left half (for a quarter ad) and a right half (for a filler),
 *  separated by a small gutter — so quarter ad + filler together fill the half-page band
 *  (two "quarter page" columns = one half page; see the client's size reference). */
export function splitGapForQuarter(box: GapBox): { adBox: GapBox; fillerBox: GapBox } {
  const colW = (box.w - QUARTER_GUTTER) / 2
  return {
    adBox: { x: box.x, y: box.y, w: colW, h: box.h },
    fillerBox: { x: box.x + colW + QUARTER_GUTTER, y: box.y, w: colW, h: box.h },
  }
}

/**
 * Place a half-page (landscape) ad at the BOTTOM of its gap and hand the leftover TOP band
 * back for a filler, separated by a small gutter. A landscape ad fit to the gap width is
 * usually SHORTER than the tall gap, so {@link drawAdInBox}'s centered fit leaves empty bands
 * both above AND below it (see the client's page-124 markup). Instead we bottom-align the ad
 * (it sits just above the footer clearance, where the gap bottom already is) and fill the
 * space above with a filler — the vertical counterpart of {@link splitGapForQuarter}.
 * `fillerBox` is null when the ad (nearly) fills the gap, so nothing worth filling remains.
 */
export function splitGapForHalf(box: GapBox, ad: LoadedAd): { adBox: GapBox; fillerBox: GapBox | null } {
  const adH = Math.min(box.h, box.w / ad.aspect) // ad height when fit to the gap width
  const adBox: GapBox = { x: box.x, y: box.y + box.h - adH, w: box.w, h: adH }
  const topH = box.h - adH - STACK_GUTTER
  const fillerBox: GapBox | null = topH > 0 ? { x: box.x, y: box.y, w: box.w, h: topH } : null
  return { adBox, fillerBox }
}

// ---------------------------------------------------------------------------
// Page numbering (master "Download Everything" export only).
// ---------------------------------------------------------------------------
// The page-frame artwork carries a small navy disc (#192854, r≈14.2 in the 527.2×697.3
// border-*.svg viewBox) in the OUTER bottom corner — bottom-RIGHT on a recto page
// (border-right.svg) and bottom-LEFT on a verso page (border-left.svg). The master export
// prints the running page number centered inside that disc, in white. Which corner holds the
// disc is DETECTED from the rasterized sheet (sampling both mirrored centers and taking the
// navy one) rather than inferred from page parity — inserted ad/blank pages shift the PDF's
// page parity away from each component's own recto/verso choice, so only the pixels are
// authoritative. The disc sits in the footer band (≈96% down), well below any tucked
// ad/filler, so the number never collides with them.
const CIRCLE_CY = 669 // disc center Y in the border viewBox (same on both sides)
const CIRCLE_CX_RIGHT = 484.7 // recto disc center X
const CIRCLE_CX_LEFT = 38.6 // verso disc center X
const FRAME_W = 527.2 // border-*.svg viewBox width
const FRAME_H = 697.3 // border-*.svg viewBox height
const CIRCLE_FY = CIRCLE_CY / FRAME_H
const CIRCLE_FX_RIGHT = CIRCLE_CX_RIGHT / FRAME_W
const CIRCLE_FX_LEFT = CIRCLE_CX_LEFT / FRAME_W
// Constant type size so 1-, 2- and 3-digit numbers (the book runs into the 300s) all sit
// centered inside the ~10mm disc; center+middle alignment keeps every width centered.
const PAGE_NO_PT = 11
const PAGE_NO_NAVY_MAX_L = 100 // a sampled corner darker than this is the navy disc (brown≈132)

/** Average luminance of a small patch centered at (fx,fy) fractions of the canvas. */
function patchLuminance(data: Uint8ClampedArray, W: number, H: number, fx: number, fy: number): number {
  const cx = Math.round(fx * W)
  const cy = Math.round(fy * H)
  const rad = Math.max(2, Math.round(W * 0.012)) // stays well inside the disc (r≈0.027·W)
  let sum = 0
  let n = 0
  for (let y = cy - rad; y <= cy + rad; y += 2) {
    if (y < 0 || y >= H) continue
    for (let x = cx - rad; x <= cx + rad; x += 2) {
      if (x < 0 || x >= W) continue
      const o = (y * W + x) * 4
      sum += 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
      n++
    }
  }
  return n ? sum / n : 255
}

/**
 * Draw the running page number centered in the page-frame's navy corner disc, in WHITE.
 * Detects which corner (recto=right / verso=left) holds the disc from the sheet canvas, so
 * the number tracks the printed artwork rather than the PDF page parity. No-op when neither
 * corner is the navy disc (a page without the frame) — the page still consumed its number,
 * it just isn't printed. `pageNo` is the true 1-based PDF page position (state.drawn).
 */
export function drawPageNumber(pdf: jsPDF, canvas: HTMLCanvasElement, pageNo: number): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height
  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, W, H).data
  } catch {
    return // tainted canvas (shouldn't happen — images are inlined) → skip silently
  }
  const lRight = patchLuminance(data, W, H, CIRCLE_FX_RIGHT, CIRCLE_FY)
  const lLeft = patchLuminance(data, W, H, CIRCLE_FX_LEFT, CIRCLE_FY)
  const right = lRight <= lLeft
  if ((right ? lRight : lLeft) > PAGE_NO_NAVY_MAX_L) return // no navy disc on this page
  const x = (right ? CIRCLE_FX_RIGHT : CIRCLE_FX_LEFT) * PAGE_W_MM
  const y = CIRCLE_FY * PAGE_H_MM
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(PAGE_NO_PT)
  pdf.setTextColor(255, 255, 255)
  pdf.text(String(pageNo), x, y, { align: 'center', baseline: 'middle' })
}
