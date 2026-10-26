import { createRoot } from 'react-dom/client'
import type { ReactElement } from 'react'
import { waitForFonts } from './waitForFonts'

// Inject once: force a fixed 720px sheet width inside the export host so the
// rasterized output is consistent regardless of the live window width (the
// live `.dir-sheet` uses min(720px, 96vw)).
const STYLE_ID = 'pdf-export-host-style'
function ensureHostStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  // Fix the sheet width inside the export host (the live `.dir-sheet` is
  // min(720px,96vw)). No other overrides: html-to-image renders natively, so the
  // bulk capture matches the on-screen / individual-PDF design 1:1.
  //
  // CRITICAL: pin `margin:0` on EVERY captured sheet. The live sheets use
  // `margin: … auto`, so in the wider export host they sit centred (e.g. `.ref-page`
  // at min(700px,96vw) is offset ~30px from the host's left). html-to-image leaks
  // that left margin into the capture of title-less continuation sheets — shifting
  // their content ~4% right, into the frame's right edge — while first sheets (with
  // a banner) capture correctly. Zeroing the margin removes the offset so every
  // sheet is captured flush and the content stays within the framed safe area.
  // (`.dir-sheet`/`.leader-page` were already pinned, which is why they never drift.)
  //
  // Exception: the Club ID tab's curved edge uses `clip-path: url(#…)`, which the
  // html-to-image rasterizer (DOM → SVG <foreignObject> → canvas) can fail to
  // resolve. Pin the bulk capture to the original straight polygon so the ZIP
  // never renders an unclipped rectangle. Screen + the individual print-to-PDF
  // (window.print, which resolves the ref natively) keep the curve.
  style.textContent =
    '.pdf-export-host .dir-sheet,.pdf-export-host .leader-page{width:720px!important;max-width:none!important;margin:0!important;box-shadow:none!important}' +
    '.pdf-export-host .ref-page{width:min(700px,96vw)!important;margin:0!important;box-shadow:none!important}' +
    '.pdf-export-host .club-bod-card .club-id{clip-path:polygon(0 0,100% 0,100% 100%,3.4cqw 100%)!important}'
  document.head.appendChild(style)
}

/**
 * Mount a React element into an off-screen host, run `fn` against the host DOM
 * (capture), then tear everything down. The host is reused for one document at
 * a time so memory from the capture canvases is released between documents.
 */
export async function withOffscreen<T>(
  element: ReactElement,
  fn: (root: HTMLElement) => Promise<T>,
  opts?: { settleMs?: number },
): Promise<T> {
  ensureHostStyle()
  const host = document.createElement('div')
  host.className = 'pdf-export-host'
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:760px;background:#fff;z-index:-1;'
  document.body.appendChild(host)

  const root = createRoot(host)
  root.render(element)

  // Let React commit + the browser lay out before we touch the DOM. Static layouts
  // (the directory sheets) settle in ~150ms; the reference / leader pages paginate
  // asynchronously (their own measure + fonts.ready + 400-500ms timers set the sheet
  // count), so callers pass a larger `settleMs` to let that finish BEFORE we inline
  // images and capture — otherwise a late re-render could move an <img> to a new
  // sheet and drop the base64 src we just inlined.
  await new Promise((r) => setTimeout(r, opts?.settleMs ?? 150))
  await waitForFonts()

  try {
    return await fn(host)
  } finally {
    root.unmount()
    host.remove()
  }
}
