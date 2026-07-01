import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'

// B5-ish page matching the Border.svg artwork (viewBox 527.24 × 697.32).
const PAGE_W_MM = 186
const PAGE_H_MM = 246

// rotaryindia.org photos have no CORS headers; route them through the dev
// /imgproxy so they become same-origin and can be fetched + inlined as base64.
function toProxied(url: string): string {
  if (!url || url.startsWith('data:')) return url
  return url.replace(/^https?:\/\/rotaryindia\.org/i, '/imgproxy')
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

/** Replace cross-origin <img> sources with inlined base64 so the capture can
 *  embed them without tainting the canvas. Same-origin assets (the frame SVGs,
 *  the bundled dummy photo) are left untouched. */
export async function inlineImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute('src') || ''
      if (!src || src.startsWith('data:')) return
      const proxied = toProxied(src)
      if (proxied === src && !proxied.startsWith('/imgproxy')) return // same-origin
      const dataUrl = await fetchAsDataUrl(proxied)
      if (dataUrl) img.setAttribute('src', dataUrl)
    }),
  )
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

/** Swap each page-frame SVG background (`.dir-bg` / `.lp-bg`) for a cached,
 *  rasterized PNG to keep the capture light. No-op for already-inlined sources. */
export async function rasterizeBackgrounds(root: HTMLElement): Promise<void> {
  const bgs = Array.from(root.querySelectorAll('.dir-bg, .lp-bg')) as HTMLImageElement[]
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

/** Rasterize every B5 sheet (.dir-sheet / .leader-page) in the subtree into a
 *  single multi-page PDF and return it as a Blob. Returns null if no sheets.
 *
 *  Uses html-to-image (DOM → SVG <foreignObject> → canvas), which renders with
 *  the BROWSER'S native engine — exactly like the individual "Download PDF"
 *  (window.print). This keeps the bulk output identical to the individual one:
 *  clipped/ellipsised values, the SVG page frame, and grid alignment all match.
 *  (html2canvas re-implements CSS and diverged — dropped the SVG frame and
 *  garbled clipped text — so it produced a different, broken design.)
 *
 *  NOTE: do NOT pass an explicit `fontEmbedCSS`. `getFontEmbedCSS` returns ~2 MB
 *  here (index.html loads ~10 Google font families), and injecting that into
 *  every sheet's foreignObject makes `toCanvas` hang. Its internal auto-embed is
 *  far lighter — leave it to do the work. */
export async function sheetsToPdfBlob(root: HTMLElement): Promise<Blob | null> {
  const sheets = Array.from(root.querySelectorAll('.dir-sheet, .leader-page')) as HTMLElement[]
  if (!sheets.length) return null

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE_W_MM, PAGE_H_MM] })
  for (let i = 0; i < sheets.length; i++) {
    const canvas = await toCanvas(sheets[i], {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    })
    const img = canvas.toDataURL('image/jpeg', 0.92)
    if (i > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], 'portrait')
    pdf.addImage(img, 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM)
  }
  return pdf.output('blob')
}
