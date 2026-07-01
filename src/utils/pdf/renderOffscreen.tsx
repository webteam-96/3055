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
  style.textContent =
    '.pdf-export-host .dir-sheet,.pdf-export-host .leader-page{width:720px!important;max-width:none!important;margin:0!important;box-shadow:none!important}'
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
): Promise<T> {
  ensureHostStyle()
  const host = document.createElement('div')
  host.className = 'pdf-export-host'
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:760px;background:#fff;z-index:-1;'
  document.body.appendChild(host)

  const root = createRoot(host)
  root.render(element)

  // Let React commit + the browser lay out before we touch the DOM.
  await new Promise((r) => setTimeout(r, 150))
  await waitForFonts()

  try {
    return await fn(host)
  } finally {
    root.unmount()
    host.remove()
  }
}
