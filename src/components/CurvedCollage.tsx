import { useLayoutEffect, useRef, useState } from 'react'
import './CurvedCollage.css'

/**
 * CurvedCollage — an editorial photo mosaic for the "My Journey" album. Photos are
 * grouped into rows of varying counts (big/small variety) and laid out as gently
 * flowing, soft-cornered tiles. There are NO painted borders: the tiles are inset so
 * the cream sheet shows THROUGH the gaps (a real, transparent separation, not a drawn
 * line), and the whole mosaic sits inside the sheet's corner brackets which frame it.
 * Each photo is cover-placed with a top-biased vertical focus so faces stay visible.
 * The framed sheet + navy title banner around it are untouched.
 */

type Pt = { x: number; y: number }
const W = 100 // horizontal viewBox units; height (H) is measured to match the container.

// Real spacing between tiles (in viewBox units): each tile is inset toward its own
// centre by GAP_D, so between two neighbours the cream paper shows through ≈2·GAP_D.
const GAP_D = 0.75
// Boundary resample spacing — uniform samples so corner rounding is even everywhere
// (straight edges stay straight; only the sharp corners round).
const STEP = 2.4

// Wave-shape parameters, so a specific page can use a calmer frame without changing the
// others. DEFAULT = the "popped-up" curves; SMOOTH = gentle single sweeps (no 2nd
// harmonic, lower amplitude, larger resample step → rounder, smoother corners).
// `valley`: interior dividers sweep as a single symmetric dip in the CENTRE (instead of
// the S-curve), so a centred bubble nestles into the seam — the marked Navoday style.
type CurveOpts = { divAmp: number; splitW: number; splitCell: number; harmonic: number; step: number; valley?: boolean }
const CURVE_DEFAULT: CurveOpts = { divAmp: 0.17, splitW: 0.11, splitCell: 0.34, harmonic: 0.22, step: STEP }
const CURVE_SMOOTH: CurveOpts = { divAmp: 0.11, splitW: 0.07, splitCell: 0.24, harmonic: 0, step: 3.3 }
const CURVE_VALLEY: CurveOpts = { divAmp: 0.16, splitW: 0.07, splitCell: 0.24, harmonic: 0, step: 3.3, valley: true }

// Default vertical crop focus (0 = top, 0.5 = centre, 1 = bottom). Biased upward so
// faces — usually in the upper part of a photo — are kept when a tile crops vertically.
const DEFAULT_FOCUS = 0.3
// Per-photo focus overrides (keyed by /journey/... url) for shots whose faces sit
// lower/higher than usual. Add entries as needed; anything not listed uses the default.
const FOCUS: Record<string, number> = {
  '/journey/rotary/3.jpg': 0.42, // Red Cross group — centre on the faces
  '/journey/rotary/2.jpg': 0.62, // PETS-SETS — nudge the two men further up
  '/journey/rotary/1.jpg': 0.12, // board members (middle) — nudged down a bit more
  '/journey/rotary/5.jpg': 0, // 5th (bottom-right) — down-most; needs a touch of zoom to gain vertical room
  '/journey/rotary/6.jpg': 0, // bottom-right — pushed all the way down (shows image top)
  // --- page 2 ---
  '/journey/rotary/9.jpg': 0.15, // middle wide — heads sit high; show more of the top so they aren't clipped
  '/journey/rotary/10.jpg': 0.58, // Chirag group — moved up a little (faces sit higher in the frame)
  '/journey/rotary/11.jpg': 0.4, // Chirag group (portrait) — moved up (show lower part of the frame)
  // --- navyug page 2 ---
  '/journey/navyug/1.jpg': 0.5, // top panorama — moved up
  '/journey/navyug/10.jpg': 0.5, // 4th — moved up
  '/journey/navyug/11.jpg': 0.5, // 5th — moved up
  // --- natrutva: big assemblies in full-width tiles — centre faces in the top/bottom crop ---
  '/journey/natrutva/11.jpg': 0.45,
  '/journey/natrutva/13.jpg': 0.45,
  '/journey/natrutva/2.jpg': 0, // 2nd photo — moved down to the limit (headroom above the high faces so heads aren't clipped)
  // --- natrutva page 2 ---
  '/journey/natrutva/1.jpg': 0.15, // p2 2nd photo — moved a little down
  '/journey/natrutva/8.jpg': 0.45, // p2 4th photo — moved a little up
  '/journey/natrutva/9.jpg': 0.05, // p2 5th photo — zoomed in; kept near the top so the faces (high in the frame) aren't cropped
  // --- navodipt ---
  '/journey/navodipt/1.jpg': 0.05, // p1 2nd photo (couple portrait) — moved a little down (shows more top / headroom)
  '/journey/navodipt/3.jpg': 0.18, // p1 4th photo (full-width) — moved a little down
  '/journey/navodipt/7.jpg': 0.35, // p2 feature (full-width) — centre the standing-group face band
  '/journey/navodipt/8.jpg': 0.4, // p2 — centre on the felicitation faces
  '/journey/navodipt/9.jpg': 0.2, // p2 — moved a little down
  '/journey/navodipt/10.jpg': 0.22, // p2 — moved a little down
  // --- navoday ---
  '/journey/navoday/1.jpg': 0.48, // p1 photo 1 (full-width) — moved up a little more
  '/journey/navoday/6.jpg': 0.55, // p2 photo 1 (hero) — moved further up
  '/journey/navoday/7.jpg': 0.55, // p2 photo 4 (full-width) — moved further up
  '/journey/navoday/11.jpg': 0.45, // p2 photo 6 — moved up
}
// Per-photo HORIZONTAL focus overrides (keyed by url; default 0.5 = centre). Higher = show
// more of the RIGHT (moves the subject left); lower = show more of the LEFT.
const FOCUS_X: Record<string, number> = {
  '/journey/rotary/2.jpg': 0.6, // PETS-SETS — nudge the two men left
  '/journey/rotary/11.jpg': 0, // Chirag group (portrait) — panned to the left edge → group as far right as it goes gaplessly
  '/journey/rotary/6.jpg': 0.68, // oath pair (4th) — move left so both men's faces clear the right seam
  '/journey/natrutva/2.jpg': 0.6, // 2nd photo — nudged left (higher fx) while keeping all 3 faces in
  '/journey/natrutva/5.jpg': 0.85, // 4th photo — moved further left
  '/journey/natrutva/6.jpg': 0.15, // 5th photo — moved further right
  '/journey/natrutva/9.jpg': 0.55, // p2 5th photo — re-centred so all three faces stay in once zoomed
  // --- navoday (lower fx = subject shifts right) ---
  '/journey/navoday/3.jpg': 0.25, // p1 photo 3 — moved further right
  '/journey/navoday/8.jpg': 0.38, // p2 photo 3 — moved right
  // --- navodipt ---
  '/journey/navodipt/5.jpg': 0.64, // p2 2nd photo — pan the subject a little to the LEFT (show more of the right)
}
// Per-photo zoom overrides (keyed by url; default 1). <1 zooms OUT (shows more of the
// photo, with a small inset toward the tile edges); >1 zooms in.
const ZOOM: Record<string, number> = {
  '/journey/rotary/3.jpg': 1.6, // zoom in more on the group
  '/journey/rotary/2.jpg': 2.3, // zoom in more on the two men
  '/journey/rotary/6.jpg': 1.6, // 4th (bottom-left) — zoomed in
  '/journey/rotary/5.jpg': 1.6, // 5th (bottom-right) — zoomed in more; at FOCUS 0 this also pushes the subject further down
  '/journey/natrutva/2.jpg': 1.8, // 2nd photo — tight upper-body crop so all 3 faces read clearly, below the wavy top
  '/journey/natrutva/5.jpg': 1.12, // 4th photo — zoomed out (keeps just enough room for the left move)
  '/journey/natrutva/6.jpg': 1.12, // 5th photo — zoomed out (keeps just enough room for the right move)
  // --- page 2 ---
  '/journey/rotary/10.jpg': 1.65, // Chirag group — zoomed in further so faces read clearly
  '/journey/rotary/11.jpg': 1.1, // Chirag group (portrait) — mild zoom; capped so BOTH end people stay in
  '/journey/rotary/8.jpg': 0.92, // Supreme felicitation — slight zoom-in from 0.88; still the widest that keeps all 4 faces
  // --- natrutva page 2 (zoom-in also gives the vertical room for the up/down moves) ---
  '/journey/natrutva/1.jpg': 1.3, // p2 2nd photo — zoomed in
  '/journey/natrutva/8.jpg': 1.3, // p2 4th photo — zoomed in
  '/journey/natrutva/9.jpg': 1.3, // p2 5th photo — zoomed in
  // --- navoday ---
  '/journey/navoday/2.jpg': 1.15, // p1 photo 2 — zoomed in a little
  '/journey/navoday/4.jpg': 1.2, // p1 photo 4 — zoomed in
  '/journey/navoday/5.jpg': 1.2, // p1 photo 5 — zoomed in
  '/journey/navoday/6.jpg': 1.2, // p2 photo 1 (hero) — zoomed in
  // --- navodipt ---
  '/journey/navodipt/7.jpg': 1.08, // p2 feature (full-width) — zoomed in a little
  '/journey/navodipt/5.jpg': 1.12, // p2 2nd photo — slight zoom so it has room to pan left
}

// Per-row tile-width overrides for the curved mosaic, keyed by the row's FIRST photo url.
// Each array gives the interior seam x-positions as fractions of the row width (length =
// cells − 1); omit a row to split it evenly. Lets a specific row have unequal-width frames.
const SPLIT_RATIOS: Record<string, number[]> = {
  '/journey/rotary/6.jpg': [0.35], // page-1 bottom row — 4th tile (6) clearly narrower than 5th (5)
  '/journey/rotary/10.jpg': [0.35], // page-2 bottom row — 4th tile (10) clearly narrower than 5th (11)
  '/journey/natrutva/9.jpg': [0.333], // natrutva p2 bottom row — keep 9.jpg (5th) at ~1/3; give 10.jpg (7th) the wider rest
  '/journey/navodipt/1.jpg': [0.35], // navodipt p1 pair — 2nd photo (portrait) widened; 3rd photo (landscape 4.jpg) takes the narrower rest
}

// Per-page row-structure override, keyed by the page's FIRST photo url — lets a specific
// page force its own row pattern instead of the count-based default (below). Used where a
// page's ideal layout differs from what its photo count would otherwise pick.
const PAGE_PATTERN: Record<string, number[]> = {
  '/journey/natrutva/7.jpg': [2, 2, 2], // natrutva p2 — three even rows of 2 (12.jpg is a bubble now, not a tile)
  // Navoday (aspect-fit): only 2- and 3-photo rows, so every tile stays landscape and the
  // full-width group photos never lose their edge faces. (A 1-photo row would be a huge
  // full-width 3:2 tile that overflows the sheet.)
  // Feature-led so the wavy tiles fill the page top-to-bottom (a full-width tile is tall
  // in 3:2, the only no-crop way to use the vertical space): a hero, then supporting rows.
  // p1 (equal-height): photo 1 full-width, photos 2&3 a pair, photos 4&5 a pair.
  '/journey/navoday/1.jpg': [1, 2, 2], // p1 — full-width + pair + pair (5 photos)
  // p2 (equal-height): a shorter full-width hero, a pair, a full-width photo, a pair.
  '/journey/navoday/6.jpg': [1, 2, 1, 2], // p2 — full + pair + full + pair (6 photos)
  // Navodipt (justified aspect-fit): p1 pairs the portrait (1) with a landscape, then a
  // landscape pair; p2 is a feature landscape + pair + trio. No 1-photo portrait row (a
  // full-width portrait would be far too tall).
  '/journey/navodipt/2.jpg': [1, 2, 1], // p1 — full-width, then [landscape, portrait] pair, then full-width (fills the sheet)
  '/journey/navodipt/7.jpg': [1, 2, 2], // p2 (aspect-fit, no crop) — feature (7) on top, pair (5,8), pair (9,10). 2nd photo (6) removed.
}

// Row structure per photo count — a mix of 1/2/3-photo rows gives the big/small variety
// of an editorial spread. Falls back to rows of ~2–3 for counts outside the table.
function patternFor(n: number, firstSrc?: string): number[] {
  if (firstSrc && PAGE_PATTERN[firstSrc]) return PAGE_PATTERN[firstSrc]
  const table: Record<number, number[]> = {
    1: [1], 2: [2], 3: [1, 2], 4: [1, 2, 1], 5: [2, 1, 2], 6: [1, 2, 2, 1],
    7: [2, 2, 3], 8: [1, 2, 2, 3], 9: [2, 2, 2, 3], 10: [2, 3, 2, 3],
  }
  if (table[n]) return table[n]
  const rows: number[] = []
  let m = n
  while (m > 0) { const t = m >= 5 ? 3 : m >= 2 ? 2 : 1; rows.push(t); m -= t }
  return rows
}

// A straight horizontal edge at height y (top/bottom of the mosaic).
function straightRow(y: number): Pt[] {
  const pts: Pt[] = []
  for (let k = 0; k <= 120; k++) pts.push({ x: (k / 120) * W, y })
  return pts
}
// A gentle sweeping S around baseY — a full sine period plus an optional soft second
// harmonic, with a per-divider phase so the curves feel organic rather than echo one
// another. Low amplitude so a group photo's faces are never sliced.
function wavyRow(baseY: number, amp: number, phase: number, c: CurveOpts): Pt[] {
  const pts: Pt[] = []
  for (let k = 0; k <= 120; k++) {
    const x = (k / 120) * W
    const u = x / W
    // Valley: one symmetric dip down at the centre (0 at both edges) so the seam cradles
    // a centred bubble. Otherwise the usual sweeping S (sine + optional soft harmonic).
    const y = c.valley
      ? baseY + Math.abs(amp) * Math.sin(Math.PI * u)
      : baseY + amp * (Math.sin(2 * Math.PI * u + phase) + c.harmonic * Math.sin(4 * Math.PI * u + phase))
    pts.push({ x, y })
  }
  return pts
}

// A horizontal divider line at row-fraction i/R, sampled as a polyline. Interior
// dividers sweep as a gentle S, direction alternating so neighbours interlock. Divider
// 0 and R are the straight top/bottom edges.
function dividerPolyline(i: number, R: number, H: number, c: CurveOpts = CURVE_DEFAULT): Pt[] {
  if (i === 0) return straightRow(0)
  if (i === R) return straightRow(H)
  return wavyRow((i / R) * H, (H / R) * c.divAmp * (i % 2 ? 1 : -1), i * 0.7, c)
}

// All R+1 horizontal dividers. Equal-height rows by default (baseY = i/R·H). When
// `rowHeights` is given (aspect-fit mode) the dividers sit at the cumulative row
// boundaries instead, and each interior wave's amplitude scales to its own (often
// smaller) row so the sweep stays gentle. Straight top (y=0) / bottom (y=H) edges either
// way. With no `rowHeights` this returns exactly what the equal-height path always did.
function buildDividers(R: number, H: number, c: CurveOpts, rowHeights?: number[]): Pt[][] {
  if (!rowHeights) return Array.from({ length: R + 1 }, (_, i) => dividerPolyline(i, R, H, c))
  const ys: number[] = [0]
  for (const h of rowHeights) ys.push(ys[ys.length - 1] + h)
  return ys.map((y, i) => {
    if (i === 0) return straightRow(0)
    if (i === R) return straightRow(H)
    const localH = Math.min(rowHeights[i - 1], rowHeights[i])
    return wavyRow(y, localH * c.divAmp * (i % 2 ? 1 : -1), i * 0.7, c)
  })
}

// y on a divider polyline at an arbitrary x (linear interpolation between samples).
function yAt(poly: Pt[], x: number): number {
  if (x <= poly[0].x) return poly[0].y
  const last = poly[poly.length - 1]
  if (x >= last.x) return last.y
  for (let k = 1; k < poly.length; k++) {
    if (x <= poly[k].x) {
      const a = poly[k - 1], b = poly[k]
      const t = (x - a.x) / (b.x - a.x || 1)
      return a.y + t * (b.y - a.y)
    }
  }
  return last.y
}

// The stretch of a divider polyline between x1 and x2 (inclusive endpoints), in the
// order x1→x2. Interior sample points lie ON the shared polyline so two neighbouring
// tiles trace exactly the same curve before insetting → even gaps.
function dividerSegment(poly: Pt[], x1: number, x2: number): Pt[] {
  const a = Math.min(x1, x2), b = Math.max(x1, x2)
  const seg: Pt[] = [{ x: a, y: yAt(poly, a) }]
  for (const p of poly) if (p.x > a && p.x < b) seg.push(p)
  seg.push({ x: b, y: yAt(poly, b) })
  return x1 <= x2 ? seg : seg.reverse()
}

// A vertical seam bulging gently left/right, from the top divider down to the bottom
// divider at base x. Endpoints sit exactly on the dividers (sin = 0 there) so corners
// meet cleanly. Amplitude stays small in busy rows to keep clear of neighbours.
function splitPolyline(baseX: number, top: Pt[], bottom: Pt[], dir: number, cells: number, c: CurveOpts = CURVE_DEFAULT): Pt[] {
  const y0 = yAt(top, baseX), y1 = yAt(bottom, baseX)
  const amp = Math.min(W * c.splitW, (W / cells) * c.splitCell) * dir
  const steps = 24
  const pts: Pt[] = []
  for (let k = 0; k <= steps; k++) {
    const t = k / steps
    pts.push({ x: baseX + amp * Math.sin(Math.PI * t), y: y0 + t * (y1 - y0) })
  }
  return pts
}

type Cell = { points: Pt[]; bbox: { x: number; y: number; w: number; h: number } }

function bboxOf(points: Pt[]) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y)
  const x = Math.min(...xs), y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

// Build all tiles (in photo order). Each is a closed polyline boundary; the render
// insets it (revealing the paper) and rounds its corners.
function buildLayout(photos: CollagePhoto[], H: number, curve: CurveOpts = CURVE_DEFAULT, rowHeights?: number[]): Cell[] {
  const pattern = patternFor(photos.length, photos[0]?.src)
  const R = pattern.length
  const dividers = buildDividers(R, H, curve, rowHeights)
  const cells: Cell[] = []

  let idx = 0 // running photo index — cells are built in photo order, row by row L→R
  for (let r = 0; r < R; r++) {
    const top = dividers[r], bottom = dividers[r + 1]
    const c = pattern[r]
    // Interior seam positions. Aspect-fit rows are JUSTIFIED — each tile's width is
    // proportional to its photo's aspect ratio, so every tile ends up at its own natural
    // ratio (a portrait next to a landscape both show in full, no crop). Otherwise: even
    // split, or a per-row SPLIT_RATIOS override (keyed by the row's first photo).
    const ratios = SPLIT_RATIOS[photos[idx]?.src ?? '']
    let frac: number[] | null
    if (ratios && ratios.length === c - 1) {
      // Explicit per-row widths win (even in aspect-fit) so a specific tile can be widened.
      frac = ratios
    } else if (rowHeights) {
      const rowPhotos = photos.slice(idx, idx + c)
      const sumAr = rowPhotos.reduce((s, p) => s + (p.ar || 1.5), 0) || 1.5
      frac = []
      let acc = 0
      for (let s = 0; s < c - 1; s++) {
        acc += rowPhotos[s].ar || 1.5
        frac.push(acc / sumAr)
      }
    } else {
      frac = null
    }
    const xs = Array.from({ length: c + 1 }, (_, s) =>
      s === 0 ? 0 : s === c ? W : (frac ? frac[s - 1] : s / c) * W,
    )
    const splits: Pt[][] = []
    for (let s = 1; s < c; s++) {
      splits.push(splitPolyline(xs[s], top, bottom, (r + s) % 2 ? 1 : -1, c, curve))
    }
    for (let j = 0; j < c; j++) {
      const leftX = xs[j], rightX = xs[j + 1]
      const topEdge = dividerSegment(top, leftX, rightX) // L→R
      const rightEdge =
        j + 1 === c
          ? [{ x: W, y: yAt(top, W) }, { x: W, y: yAt(bottom, W) }] // page right edge
          : splits[j] // top→bottom
      const bottomEdge = dividerSegment(bottom, rightX, leftX) // R→L
      const leftEdge =
        j === 0
          ? [{ x: 0, y: yAt(bottom, 0) }, { x: 0, y: yAt(top, 0) }] // page left edge
          : [...splits[j - 1]].reverse() // bottom→top
      const points = [...topEdge, ...rightEdge, ...bottomEdge, ...leftEdge]
      cells.push({ points, bbox: bboxOf(points) })
    }
    idx += c
  }
  return cells
}

// Move every boundary point toward the tile's centre by `d` (clamped), so the tile
// shrinks a hair and the paper shows through the gap it leaves. Uses the bbox centre
// (stable regardless of how densely each edge was sampled).
function insetToward(points: Pt[], cx: number, cy: number, d: number): Pt[] {
  return points.map((p) => {
    const dx = cx - p.x, dy = cy - p.y
    const len = Math.hypot(dx, dy) || 1
    const move = Math.min(d, len * 0.45)
    return { x: p.x + (dx / len) * move, y: p.y + (dy / len) * move }
  })
}

// Resample a closed boundary to roughly uniform spacing, so the smoothing that follows
// rounds every corner by the same small radius (and leaves straight runs straight).
function resample(points: Pt[], step: number): Pt[] {
  const out: Pt[] = [points[0]]
  let acc = 0
  for (let i = 1; i < points.length; i++) {
    let a = out[out.length - 1]
    const b = points[i]
    let seg = Math.hypot(b.x - a.x, b.y - a.y)
    while (acc + seg >= step && seg > 1e-6) {
      const t = (step - acc) / seg
      const np = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      out.push(np)
      acc = 0
      a = np
      seg = Math.hypot(b.x - a.x, b.y - a.y)
    }
    acc += seg
  }
  return out.length >= 3 ? out : points
}

// A closed, softly-rounded path through `pts` (quadratic through each vertex, anchored
// at edge midpoints). With uniform samples this rounds sharp corners by ~half the step
// while hugging smooth/straight edges — the "soft cornered tile" look.
function smoothPath(pts: Pt[]): string {
  const n = pts.length
  const mid = (a: Pt, b: Pt) => `${((a.x + b.x) / 2).toFixed(2)} ${((a.y + b.y) / 2).toFixed(2)}`
  let d = `M ${mid(pts[n - 1], pts[0])} `
  for (let i = 0; i < n; i++) {
    const cur = pts[i], nxt = pts[(i + 1) % n]
    d += `Q ${cur.x.toFixed(2)} ${cur.y.toFixed(2)} ${mid(cur, nxt)} `
  }
  return d + 'Z'
}

// Cover-place a photo of aspect `ar` inside box (bx,by,bw,bh): scale so it fully covers
// the box (like object-fit:cover), then position with focus fx/fy (0=left/top,
// 0.5=centre, 1=right/bottom). Use with preserveAspectRatio="none" so we control the
// crop (fy top-biased keeps faces).
function coverPlace(bx: number, by: number, bw: number, bh: number, ar: number, fx: number, fy: number, zoom = 1) {
  const boxAr = bw / bh
  let w: number, h: number
  if (ar >= boxAr) { h = bh; w = bh * ar } else { w = bw; h = bw / ar }
  w *= zoom; h *= zoom
  return { x: bx - (w - bw) * fx, y: by - (h - bh) * fy, w, h }
}

let _uid = 0

export type CollagePhoto = { src: string; ar: number }

// --- Bubble overlays -------------------------------------------------------------
// Small circular photos (event logos / speaker close-ups) popped ON TOP of the wave
// mosaic — like stickers sitting on the seams. Anchored on the interior wavy dividers
// (where photos meet — the natural gaps), so they nestle into the wave rather than
// covering a face. White ring + soft drop shadow give the raised, bubble look.
const BUBBLE_R = 8.6 // circle radius in viewBox units (~17% of width as diameter)
const BUBBLE_RING = 0.55 // white ring thickness around each photo (thin frame — all bubbles are Navyug onwards)
const BUBBLE_FOCUS: Record<string, [number, number]> = {
  '/journey/navyug/circles/2.jpg': [0.5, 0.08], // speaker bubble — face sits high; keep it in view when zoomed
  '/journey/natrutva/circles/1.jpg': [0.5, 0.5], // Netrutva logo — centred (full logo shown when zoomed out)
  '/journey/natrutva/circles/2.jpg': [0.65, 0.3], // natrutva p2 bubble (Circles/12) — photo brought down and panned left in the frame
  '/journey/navoday/circles/2.jpg': [0.5, 0.55], // p1 2nd bubble — photo moved up in the frame
}
const BUBBLE_R_MULT: Record<string, number> = {
  '/journey/navyug/circles/1.jpg': 1.3, // logo bubble (navyug p1) — enlarged frame
  '/journey/navyug/circles/2.jpg': 1.3, // speaker bubble (navyug p2) — a little bigger
  '/journey/natrutva/circles/1.jpg': 1.25, // Netrutva logo bubble — frame decreased a little
  '/journey/natrutva/circles/2.jpg': 1.4, // natrutva p2 bubble (Circles/12) — frame enlarged
}
const BUBBLE_ZOOM: Record<string, number> = {
  '/journey/navyug/circles/2.jpg': 2.5, // speaker bubble (navyug p2) — zoomed in further on the face
  '/journey/natrutva/circles/1.jpg': 0.85, // Netrutva logo bubble — below cover so the FULL logo shows inside the circle
  '/journey/natrutva/circles/2.jpg': 1.8, // natrutva p2 bubble (Circles/12) — zoomed in a little more again
  '/journey/navoday/circles/1.jpg': 0.55, // p1 1st bubble — zoomed out further
  '/journey/navoday/circles/2.jpg': 2.2, // p1 2nd bubble — zoomed in further again
  '/journey/navoday/circles/3.jpg': 1.3, // p2 1st bubble — zoomed in
}
// Per-bubble absolute position override [xFrac, yFrac] of the mosaic (else auto-placed on a seam).
const BUBBLE_POS: Record<string, [number, number]> = {
  '/journey/natrutva/circles/1.jpg': [0.53, 0.46], // nudged a little right of centre; moved up from the middle then back down a little
  '/journey/natrutva/circles/2.jpg': [0.44, 0.64], // natrutva p2 bubble (Circles/12) — nudged a little further down
  '/journey/navyug/circles/1.jpg': [0.5, 0.33], // navyug p1 logo bubble — moved a little right
  '/journey/navyug/circles/2.jpg': [0.18, 0.5], // navyug p2 speaker bubble — between the 2nd (8) & 4th (10) photos; moved left
  // Navoday p1 — centred in the valley dip of each interior seam (3 rows: seams at ~1/3, 2/3).
  '/journey/navoday/circles/1.jpg': [0.11, 0.34], // 1st bubble — left edge; a little up
  '/journey/navoday/circles/2.jpg': [0.5, 0.72], // 2nd seam (pair ↔ pair)
  // Navoday p2 bubbles.
  '/journey/navoday/circles/3.jpg': [0.91, 0.18], // 1st bubble — top-right corner; a little down
  '/journey/navoday/circles/4.jpg': [0.45, 0.78], // 2nd bubble — moved left and further down
  // Navodipt p1 bubbles — nudged from their default seam spots (auto ~[0.26,0.36], [0.74,0.30], [0.26,0.66]).
  '/journey/navodipt/circles/1.jpg': [0.36, 0.38], // 1st bubble — towards the right + very little down
  '/journey/navodipt/circles/2.jpg': [0.9, 0.32], // 2nd bubble — right edge; moved up
  '/journey/navodipt/circles/3.jpg': [0.1, 0.71], // 3rd bubble — further left + a little up
  // Navodipt p2 bubbles — moved toward the right and down from their default seam spots.
  '/journey/navodipt/circles/4.jpg': [0.52, 0.43], // p2 1st bubble — a little up
  '/journey/navodipt/circles/5.jpg': [0.06, 0.7], // p2 2nd bubble — at the left edge, a little further down
}
type Bubble = { c: CollagePhoto; x: number; y: number; r: number }

// Staggered x per divider when one bubble lands on each (avoids a straight vertical stack).
const BUBBLE_DIV_X = [0.4, 0.6, 0.5, 0.35, 0.65]
function placeBubbles(circles: CollagePhoto[], count: number, H: number, curve: CurveOpts = CURVE_DEFAULT, firstSrc?: string, rowHeights?: number[]): Bubble[] {
  if (!circles?.length) return []
  const R = patternFor(count, firstSrc).length
  const D = Math.max(1, R - 1) // interior horizontal dividers to sit the bubbles on
  const n = circles.length
  const perDiv = Math.ceil(n / D) // how many bubbles share a divider
  // Sit bubbles on the SAME dividers the tiles use (variable-height when aspect-fit).
  const dividers = buildDividers(R, H, curve, rowHeights)
  return circles.map((c, k) => {
    const r = BUBBLE_R * (BUBBLE_R_MULT[c.src] ?? 1) // per-bubble size override
    const di = Math.min(D, 1 + Math.floor(k / perDiv)) // which interior divider (1..D)
    const slot = k % perDiv
    // Horizontal: spread slots across the width; a single-per-divider bubble is staggered
    // by divider so successive bubbles zig-zag instead of stacking straight down.
    const xf = perDiv === 1 ? BUBBLE_DIV_X[(di - 1) % BUBBLE_DIV_X.length] : 0.26 + (0.48 * slot) / (perDiv - 1)
    const pos = BUBBLE_POS[c.src] // absolute placement override (fractions of the mosaic)
    const x0 = pos ? pos[0] * W : xf * W
    const y0 = pos ? pos[1] * H : R > 1 ? yAt(dividers[di], x0) : H * ((k + 1) / (n + 1))
    // Keep the whole bubble (incl. shadow margin) within the viewBox.
    const x = Math.max(r + 0.6, Math.min(W - r - 0.6, x0))
    const y = Math.max(r + 0.6, Math.min(H - r - 0.6, y0))
    return { c, x, y, r }
  })
}

export function CurvedCollage({
  photos,
  circles,
  smooth,
  aspectFit,
  valleyWaves,
}: {
  photos: CollagePhoto[]
  circles?: CollagePhoto[]
  smooth?: boolean
  /** Size each row so its wavy tiles match the photos' aspect ratio (all photos assumed
   *  the same ratio), so cover-fit never crops the sides. The mosaic renders at its
   *  natural height and the SVG letterboxes it (paper margin) instead of stretching. */
  aspectFit?: boolean
  /** Interior dividers dip as a single central valley (not the S-curve) so a centred
   *  bubble nestles into each seam — the marked Navoday page-1 style. */
  valleyWaves?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`cc${_uid++}`)
  const [H, setH] = useState(120)

  // Match the viewBox height to the container's aspect so the SVG fills it exactly with
  // no distortion or letterboxing.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setH((W * r.height) / r.width)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const curve = valleyWaves ? CURVE_VALLEY : smooth ? CURVE_SMOOTH : CURVE_DEFAULT
  // Aspect-fit (justified rows): each row's height is set from the SUM of its photos'
  // aspect ratios, so laying the tiles side by side at that height exactly fills the width
  // with every tile at its own natural ratio — no crop, mixed portrait/landscape included.
  // The 1 + 2·divAmp factor pre-shrinks the height for the ± wave crest the divider adds.
  // Hused is then the mosaic's natural height; preserveAspectRatio="meet" centres it.
  const rowHeights = aspectFit
    ? (() => {
        let i = 0
        return patternFor(photos.length, photos[0]?.src).map((cols) => {
          const sumAr = photos.slice(i, i + cols).reduce((s, p) => s + (p.ar || 1.5), 0) || 1.5
          i += cols
          return W / sumAr / (1 + 2 * curve.divAmp)
        })
      })()
    : undefined
  const Hused = rowHeights ? rowHeights.reduce((a, b) => a + b, 0) : H
  const cells = buildLayout(photos, Hused, curve, rowHeights)
  const id = idRef.current
  const bubbles = placeBubbles(circles ?? [], photos.length, Hused, curve, photos[0]?.src, rowHeights)

  // Precompute each tile's rounded, inset clip path + its cover-placed photo box.
  const tiles = cells.map((cell, i) => {
    const b = cell.bbox
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2
    const shape = smoothPath(resample(insetToward(cell.points, cx, cy, GAP_D), curve.step))
    const p = photos[i]
    const box = p ? coverPlace(b.x, b.y, b.w, b.h, p.ar, FOCUS_X[p.src] ?? 0.5, FOCUS[p.src] ?? DEFAULT_FOCUS, ZOOM[p.src] ?? 1) : null
    return { shape, p, box }
  })

  return (
    <div className="curved-collage" ref={wrapRef}>
      {/* Transparent SVG: the gaps between tiles reveal the actual cream sheet behind. */}
      <svg viewBox={`0 0 ${W} ${Hused.toFixed(2)}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          {tiles.map((t, i) => (
            <clipPath key={i} id={`${id}-${i}`}>
              <path d={t.shape} />
            </clipPath>
          ))}
          {bubbles.map((b, i) => (
            <clipPath key={`b${i}`} id={`${id}-b${i}`}>
              <circle cx={b.x} cy={b.y} r={b.r - BUBBLE_RING} />
            </clipPath>
          ))}
          {bubbles.length > 0 && (
            <filter id={`${id}-bsh`} x="-70%" y="-70%" width="240%" height="240%">
              {/* Elevated look: a soft drop shadow cast BELOW each bubble frame. */}
              <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#0b1220" floodOpacity="0.42" />
            </filter>
          )}
        </defs>
        {tiles.map((t, i) =>
          t.p && t.box ? (
            <image
              key={i}
              href={t.p.src}
              x={t.box.x}
              y={t.box.y}
              width={t.box.w}
              height={t.box.h}
              preserveAspectRatio="none"
              clipPath={`url(#${id}-${i})`}
            />
          ) : (
            <path key={i} d={t.shape} fill="#e6e9f0" />
          ),
        )}
        {/* Bubble overlays: circular logos / speaker close-ups popped on the wave seams. */}
        {bubbles.map((b, i) => {
          const rc = b.r - BUBBLE_RING
          const [fx, fy] = BUBBLE_FOCUS[b.c.src] ?? [0.5, 0.42]
          const box = coverPlace(b.x - rc, b.y - rc, 2 * rc, 2 * rc, b.c.ar, fx, fy, BUBBLE_ZOOM[b.c.src] ?? 1)
          return (
            <g key={`b${i}`}>
              <circle cx={b.x} cy={b.y} r={b.r} fill="#ffffff" filter={`url(#${id}-bsh)`} />
              <image
                href={b.c.src}
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                preserveAspectRatio="none"
                clipPath={`url(#${id}-b${i})`}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
