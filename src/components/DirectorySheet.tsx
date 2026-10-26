import type { CSSProperties, ReactNode } from 'react'
import './DirectorySheet.css'
import { useSheetBg } from './SheetBg'

// Two page backgrounds — a right-hand (recto) and left-hand (verso) variant, as
// in a bound book. Rendered as an <img> (not a CSS background) so they print.
// Each document starts on the right; pages then alternate right → left → right…
const BORDER_BG = {
  right: '/border-right.svg',
  left: '/border-left.svg',
} as const

/**
 * One print-style directory sheet: a Border page background with arbitrary
 * content overlaid. Sized to the artwork's native page (≈ B5). Used by every
 * directory module (clubs, committees, AG, other-district DGs) so the screen and
 * the downloaded PDF match exactly. `side` selects the recto/verso background.
 */
export function DirectorySheet({
  children,
  side = 'right',
}: {
  children: ReactNode
  // Accepted for backwards-compat with callers, but no longer rendered — the
  // page number in the corner was removed per request.
  pageNumber?: string | number
  side?: 'left' | 'right'
}) {
  // Per-section tint shows through the frame's now-transparent interior. Inline so it
  // is captured by html-to-image (Download PDF / All) and printed reliably. The same
  // colour is also exposed as the `--sheet-bg` custom property so the member cards that
  // sit on the sheet (committee / AG / zonal / DG / club cards) paint their body in the
  // SECTION tint too — otherwise their fixed cream covers the page and every section
  // looks identical. Each card's CSS keeps its old cream as the var() fallback.
  const sheetBg = useSheetBg()
  return (
    <section className="dir-sheet" style={{ background: sheetBg, '--sheet-bg': sheetBg } as CSSProperties}>
      <img className="dir-bg" src={BORDER_BG[side]} alt="" aria-hidden="true" />
      <div className="dir-content">{children}</div>
    </section>
  )
}
