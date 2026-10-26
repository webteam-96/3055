import type { CollagePhoto } from './CurvedCollage'
import './MomentsCollage.css'

/**
 * MomentsCollage — the DG's Family photo arrangement ONLY. The photos are placed into the
 * EXACT rectangle frames of the source artwork "DG's Family page 1/2.svg" (viewBox
 * 527.2×697.3): same centres, sizes, −30° tilt and staggered grid. Each frame simply holds
 * a photo (rounded rectangle, cover-filled). Everything outside the photos — background,
 * borders, curves, logos, the "DG'S FAMILY" heading, skyline — is left exactly as designed.
 *
 * Each placement is the frame CENTRE (l,t as % of the SHEET) plus its width and height in
 * cqw (= % of the sheet WIDTH, so aspect + rotation are undistorted). Values are measured
 * straight from the two SVGs.
 */
// `obj` overrides the photo's object-position (default '50% 35%'); `zoom` scales the photo
// inside its frame (default 1) — used to fine-tune individual photos within their frames.
type Placement = { l: number; t: number; w: number; h: number; z: number; obj?: string; zoom?: number }
const ROT = -30 // every frame is tilted −30°, exactly as the source art

// Page 1 — 6 frames in a staggered 3×2 grid (SVG placement, scaled to 0.92 and nudged
// down so the photos are a touch larger yet the top row keeps a ~3% gap below the
// "DG'S FAMILY" title (no collision) and the bottom row stays on the sheet).
const LAYOUT_6: Placement[] = [
  { l: 28.9, t: 31.69, w: 43.12, h: 21.66, z: 1, obj: '50% 52%' }, // top-left — photo nudged up
  { l: 71.01, t: 34.24, w: 44.58, h: 21.66, z: 2 }, // top-right
  { l: 28.59, t: 52.76, w: 45.36, h: 21.66, z: 3, obj: '50% 52%' }, // mid-left — photo nudged up
  { l: 71.6, t: 56.1, w: 43.51, h: 21.66, z: 4, obj: '50% 52%' }, // mid-right — photo nudged up
  { l: 30.11, t: 74.22, w: 46.33, h: 21.66, z: 5, obj: '50% 58%' }, // bottom-left — photo nudged down a little
  { l: 67.97, t: 79.04, w: 44.93, h: 21.66, z: 6 }, // bottom-right
]

// Page 2 — 4 frames on a diagonal: two large (top-left, bottom-right) + two medium.
const LAYOUT_4: Placement[] = [
  { l: 33.89, t: 32.73, w: 52.3, h: 31.76, z: 1, zoom: 1.3 }, // top-left (large) — zoomed in
  { l: 69.74, t: 45.25, w: 42.83, h: 26.02, z: 2 }, // mid-right
  { l: 30.3, t: 62.45, w: 42.83, h: 26.02, z: 3 }, // mid-left
  { l: 66.05, t: 74.83, w: 52.28, h: 31.74, z: 4 }, // bottom-right (large)
]

export function MomentsCollage({ photos }: { photos: CollagePhoto[] }) {
  const layout = photos.length <= 4 ? LAYOUT_4 : LAYOUT_6
  return (
    <div className="moments">
      {photos.map((p, i) => {
        const s = layout[i % layout.length]
        return (
          <figure
            key={i}
            className="moment-card"
            style={{
              left: `${s.l}%`,
              top: `${s.t}%`,
              width: `${s.w}cqw`,
              height: `${s.h}cqw`,
              zIndex: s.z,
              transform: `translate(-50%, -50%) rotate(${ROT}deg)`,
            }}
          >
            <img
              src={p.src}
              alt=""
              loading="eager"
              style={{
                objectPosition: s.obj,
                transform: s.zoom ? `scale(${s.zoom})` : undefined,
              }}
            />
          </figure>
        )
      })}
    </div>
  )
}
