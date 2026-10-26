// Generates src/data/dgJourneyPhotos.ts — the per-section page chunks for the
// "My Journey" photo album — from the images dropped into <root>/Photos/<Section>/.
//
// Why a generator: the album pages are fixed-size framed B5 sheets, so the number
// of photos per page depends on their aspect ratios (a tall portrait takes the room
// of two landscapes). This reads each image's real dimensions and packs them, IN
// ORDER, into the fewest balanced pages that fit the sheet's safe area — so nothing
// is clipped and pages fill evenly. Rerun after adding/removing photos:
//   node scripts/gen-journey-photos.mjs
//
// The route (src/routes/my-journey.tsx) turns each "Section/file" path below into a
// bundled URL via import.meta.glob and renders it with the existing masonry design.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
// Read the DOWNSCALED, EXIF-corrected images (produced by resize-journey-photos.ps1),
// so measured dimensions match what the browser actually renders. Served from /public.
const PHOTOS = join(ROOT, 'public', 'journey')
const OUT = join(ROOT, 'src', 'data', 'dgJourneyPhotos.ts')

// --- layout geometry, mirrored from ReferencePage.css (.ref-content + .album-*) ---
// The album uses a JUSTIFIED-ROWS layout: each row fills the page width and photos
// keep their NATURAL aspect (shown in full — no cropping). This generator groups a
// page's photos into the row count whose natural stacked height best fills the sheet,
// so pages read full while every photo stays fully visible; the tiny remainder is
// spread as even row spacing at render time. All values in cqw (% of sheet width).
const CONTENT_W = 85 // content-box width
const CONTENT_H = 105.8 // content-box height (sheet is 132.25cqw tall × 80% safe area)
const BANNER_H = 7 // title banner eats the top of a section's FIRST page
const GAP = 1 // gutter between images / rows (tight)

// Height (cqw) a justified row occupies: its photos share one height so the row fills
// the width exactly — height = (usable width) / Σ(aspect ratios).
const rowHeight = (row) => (CONTENT_W - (row.length - 1) * GAP) / row.reduce((s, p) => s + p.ar, 0)
// Natural stacked height of a set of rows (photos at true aspect), incl. row gaps.
const stackHeight = (rows) => rows.reduce((h, r) => h + rowHeight(r), 0) + (rows.length - 1) * GAP

// --- minimal, dependency-free image dimension readers (JPEG + PNG) ---
function jpgSize(buf) {
  let o = 2
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue }
    const m = buf[o + 1]
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) }
    }
    o += 2 + buf.readUInt16BE(o + 2)
  }
  return null
}
function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}
function imgSize(file) {
  const buf = readFileSync(file)
  if (buf[0] === 0x89 && buf[1] === 0x50) return pngSize(buf)
  if (buf[0] === 0xff && buf[1] === 0xd8) return jpgSize(buf)
  return null
}

// Sort "1.JPG", "2.JPG", …, "10.JPG" numerically (natural order), not lexically.
const numeric = (a, b) =>
  (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b)

// Split a page's photos into R contiguous rows (order preserved) with balanced counts
// (⌈N/R⌉ then ⌊N/R⌋), so no row is left with a single, oversized photo. Since the
// photos are near-uniform landscape, even counts give even, well-filled row heights.
function partitionRows(photos, R) {
  // Never leave a row with a single photo (it would stretch full-width and dwarf the
  // others). Capping rows at ⌊N/2⌋ guarantees every row holds ≥2 photos.
  const maxRows = Math.max(1, Math.floor(photos.length / 2))
  R = Math.max(1, Math.min(R, maxRows))
  const base = Math.floor(photos.length / R)
  const rem = photos.length % R
  const rows = []
  let i = 0
  for (let r = 0; r < R; r++) {
    const count = base + (r < rem ? 1 : 0)
    rows.push(photos.slice(i, i + count))
    i += count
  }
  return rows
}

// The render caps a row's fill-stretch at this ×natural (mirrors max-height in CSS),
// so a page can grow into ~14% of leftover height before any gap remains.
const FILL_CAP = 1.14

// Choose the row count whose natural (uncropped) stacked height best fills `avail`,
// preferring to stay just under it (a small remainder is spread as spacing; going over
// would need cropping or clipping, so it is penalised).
function bestRows(photos, avail) {
  let best = null, bestScore = Infinity
  for (let R = 1; R <= photos.length; R++) {
    const rows = partitionRows(photos, R)
    const resid = avail - stackHeight(rows)
    const score = resid >= 0 ? resid : -resid * 4 // overflow penalised 4×
    if (score < bestScore) { bestScore = score; best = rows }
  }
  return best || [photos]
}

// Evaluate one page: its best rows + a "wasted-space" cost. After the render's capped
// fill-stretch, leftover height (gap) or over-height (needs shrink-crop) both cost.
function pageEval(photos, avail) {
  const rows = bestRows(photos, avail)
  const s = stackHeight(rows)
  let cost
  if (s * FILL_CAP < avail) cost = avail - s * FILL_CAP // gap remains after the cap
  else if (s > avail) cost = (s - avail) * 0.6 // fills, but shrink-crops a little
  else cost = 0 // fills within the cap, no crop
  return { rows, cost }
}

// Sections whose photos should be a UNIFORM grid (every photo the same size) rather
// than justified rows — used when the count tiles awkwardly and the user wants even
// sizing over perfectly-filled rows.
const GRID_SECTIONS = new Set(['rotary'])
const GRID_COLS = 2

// Sections that should split the photos EVENLY across the two pages (≈half each),
// even if a lopsided split would pack marginally tighter.
const EVEN_SPLIT_SECTIONS = new Set(['navyug'])

// Sections that fill the page fully (see FULL_FILL_SECTIONS in the route): a page
// with few landscape photos must crop hard to fill, so front-load page 1 with this
// many photos (a fuller, lightly-cropped first page; the sparser, heavier-cropped
// page falls last). Tuned to the current photo counts.
const PAGE1_COUNT = { family: 6 }

// Uniform-grid pack: split into 2 pages (page 1 gets the extra so any empty cell lands
// on the last page), each rendered as a fixed 2-column grid of equal-size tiles.
function packGrid(photos) {
  const k = Math.ceil(photos.length / 2)
  return [photos.slice(0, k), photos.slice(k)].map((g) => ({
    cols: GRID_COLS,
    photos: g.map((p) => ({ src: p.file, ar: Math.round(p.ar * 1000) / 1000 })),
  }))
}

// Pack a section into EXACTLY two pages (order preserved). Instead of always splitting
// down the middle, try every split and keep the one that leaves the least wasted space
// across both pages (page 1 also loses room to the title banner).
function pack2(photos, opts = {}) {
  const n = photos.length
  // A fixed page-1 count pins the split; `even` restricts to the two most balanced
  // options (⌊n/2⌋, ⌈n/2⌉); otherwise search a wider range for the tightest fit.
  let lo, hi
  if (opts.page1 && opts.page1 < n) {
    lo = hi = opts.page1
  } else if (opts.even) {
    lo = Math.floor(n / 2)
    hi = Math.ceil(n / 2)
  } else {
    lo = Math.max(1, Math.floor(n / 3))
    hi = Math.min(n - 1, Math.ceil((2 * n) / 3))
  }
  let best = null, bestCost = Infinity
  for (let k = lo; k <= hi; k++) {
    const a = pageEval(photos.slice(0, k), CONTENT_H - BANNER_H)
    const b = pageEval(photos.slice(k), CONTENT_H)
    const cost = a.cost + b.cost + Math.abs(n - k - k) * 0.05 // tiny nudge toward balance
    if (cost < bestCost) { bestCost = cost; best = [a.rows, b.rows] }
  }
  return best.map((rows) => ({
    rows: rows.map((r) => r.map((p) => ({ src: p.file, ar: Math.round(p.ar * 1000) / 1000 }))),
  }))
}

// Sections that are hand-tuned in dgJourneyPhotos.ts (order swaps, dedup) whose outputs
// must NOT be regenerated — rotary's URL-keyed FOCUS/ZOOM/SPLIT_RATIOS in CurvedCollage
// would break if renumbered. Their existing data block is carried over verbatim.
const PRESERVE = new Set(['rotary', 'navyug', 'natrutva'])

// Extract the first balanced { … } object literal that appears after `marker` in `txt`
// (used to read the previously-generated JOURNEY_PHOTO_PAGES for the preserved sections).
function extractObjectAfter(txt, marker) {
  const m = txt.indexOf(marker)
  if (m < 0) return null
  const s = txt.indexOf('{', m)
  if (s < 0) return null
  let depth = 0
  for (let i = s; i < txt.length; i++) {
    const c = txt[i]
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) return txt.slice(s, i + 1) }
  }
  return null
}

function main() {
  if (!existsSync(PHOTOS)) {
    console.error(`No resized photos at ${PHOTOS} — run scripts/resize-journey-photos.ps1 first`)
    return
  }
  // Carry over the preserved sections' blocks from the existing generated file.
  let preserved = {}
  if (existsSync(OUT)) {
    try {
      const obj = extractObjectAfter(readFileSync(OUT, 'utf8'), 'JOURNEY_PHOTO_PAGES')
      if (obj) preserved = JSON.parse(obj)
    } catch (e) { console.warn('Could not preserve existing pages:', e.message) }
  }
  const out = {}
  const circlesOut = {}
  let totalPhotos = 0
  // Each subfolder of public/journey is a section id (natrutva, navoday, …).
  for (const id of readdirSync(PHOTOS)) {
    if (PRESERVE.has(id)) { console.log(`${id}: preserved (not regenerated)`); continue }
    const dir = join(PHOTOS, id)
    let files
    try { files = readdirSync(dir) } catch { continue }
    files = files.filter((f) => /\.(jpe?g|png)$/i.test(f)).sort(numeric)
    if (!files.length) continue
    const photos = []
    for (const f of files) {
      const s = imgSize(join(dir, f))
      if (!s || !s.w || !s.h) { console.warn(`! Unreadable image ${id}/${f}`); continue }
      photos.push({ file: `/journey/${id}/${f}`, ar: s.w / s.h })
    }
    const pages = GRID_SECTIONS.has(id)
      ? packGrid(photos)
      : pack2(photos, { even: EVEN_SPLIT_SECTIONS.has(id), page1: PAGE1_COUNT[id] })
    // Family page 2 (4 photos): a big–small–small–big collage so the 1st and 4th photos
    // read large (full-width top & bottom) with the 2nd & 3rd paired in the middle,
    // using the whole page elegantly. Only when page 2 really has 4 photos.
    if (id === 'family' && pages[1] && !pages[1].cols) {
      const flat = pages[1].rows.flat()
      if (flat.length === 4) pages[1] = { rows: [[flat[0]], [flat[1], flat[2]], [flat[3]]] }
    }
    out[id] = pages
    totalPhotos += photos.length

    // Bubble overlays: read the section's circles/ subfolder (logos / speaker close-ups).
    let cfiles
    try { cfiles = readdirSync(join(dir, 'circles')) } catch { cfiles = null }
    if (cfiles) {
      const carr = []
      for (const f of cfiles.filter((f) => /\.(jpe?g|png)$/i.test(f)).sort(numeric)) {
        const s = imgSize(join(dir, 'circles', f))
        if (!s || !s.w || !s.h) { console.warn(`! Unreadable circle ${id}/circles/${f}`); continue }
        carr.push({ src: `/journey/${id}/circles/${f}`, ar: Math.round((s.w / s.h) * 1000) / 1000 })
      }
      if (carr.length) circlesOut[id] = carr
    }

    const desc = pages.map((p) => (p.cols ? `grid ${p.photos.length}` : `${p.rows.length}rows/${p.rows.reduce((n, r) => n + r.length, 0)}`)).join(', ')
    console.log(`${id}: ${photos.length} photos → 2 pages [${desc}]${circlesOut[id] ? `, ${circlesOut[id].length} circles` : ''}`)
  }
  // Restore preserved section blocks verbatim.
  for (const id of PRESERVE) if (preserved[id]) out[id] = preserved[id]

  const banner =
    '// AUTO-GENERATED by scripts/gen-journey-photos.mjs — do not edit by hand.\n' +
    '// Per-section album for "My Journey": each section is exactly 2 pages; each page is\n' +
    '// justified rows of tiles ({src: /journey/... URL, ar: aspect ratio}) that flexbox\n' +
    '// stretches to fill the whole sheet. Rerun resize-journey-photos.ps1 then this script.\n'
  const body =
    'export interface JourneyTile { src: string; ar: number }\n' +
    '// A page is either justified `rows`, or a uniform `cols`-column grid of `photos`.\n' +
    'export interface JourneyPhotoPage { rows?: JourneyTile[][]; cols?: number; photos?: JourneyTile[] }\n' +
    'export const JOURNEY_PHOTO_PAGES: Record<string, JourneyPhotoPage[]> = ' +
    JSON.stringify(out, null, 2) +
    '\n\n' +
    '// Bubble overlays drawn as circles ON TOP of the wave mosaic — one entry per section\n' +
    '// that has a Photos/<Section>/Circles folder (logos + speaker close-ups). Rendered by\n' +
    '// CurvedCollage; positioned on the wave seams. Split across the section\'s 2 pages.\n' +
    'export const JOURNEY_CIRCLE_PHOTOS: Record<string, JourneyTile[]> = ' +
    JSON.stringify(circlesOut, null, 2) +
    '\n'
  writeFileSync(OUT, banner + body)
  const nCircles = Object.values(circlesOut).reduce((n, a) => n + a.length, 0)
  console.log(`\nWrote ${OUT} — ${totalPhotos} photos + ${nCircles} circles across ${Object.keys(out).length} sections.`)
}
main()
