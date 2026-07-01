import type { ReactNode } from 'react'
import './DirectorySheet.css'

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
  return (
    <section className="dir-sheet">
      <img className="dir-bg" src={BORDER_BG[side]} alt="" aria-hidden="true" />
      <div className="dir-content">{children}</div>
    </section>
  )
}
