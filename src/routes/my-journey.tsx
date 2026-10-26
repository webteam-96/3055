import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import { CurvedCollage, type CollagePhoto } from '../components/CurvedCollage'
import { MomentsCollage } from '../components/MomentsCollage'
import { DG_JOURNEY } from '../data/dgJourney'
import { JOURNEY_PHOTO_PAGES, JOURNEY_CIRCLE_PHOTOS, type JourneyPhotoPage, type JourneyTile } from '../data/dgJourneyPhotos'

export const Route = createFileRoute('/my-journey')({
  component: MyJourneyPage,
})

// What to render for a section: the generated pages (each tile is a /journey/... URL
// served from public/) when photos exist, otherwise placeholder pages from the slot
// counts in dgJourney.ts.
// Workflow when new photos arrive in <root>/Photos/<Section>/:
//   pwsh -File scripts/resize-journey-photos.ps1   (downscale + fix EXIF → public/journey)
//   node scripts/gen-journey-photos.mjs            (repaginate → src/data/dgJourneyPhotos.ts)
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}
function pagesFor(section: { id: string; pages: string[][] }): JourneyPhotoPage[] {
  const real = JOURNEY_PHOTO_PAGES[section.id]
  if (real) return real
  return section.pages.map((slots) => ({
    rows: chunk(slots, 2).map((row) => row.map(() => ({ src: '', ar: 1.5 }) as JourneyTile)),
  }))
}

// A page's photos in order, whatever internal grouping the generator produced — the
// curved collage re-templates them into its own wavy cells.
function pagePhotos(page: JourneyPhotoPage): CollagePhoto[] {
  const tiles = page.photos ?? (page.rows ? page.rows.flat() : [])
  return tiles.map((t) => ({ src: t.src, ar: t.ar }))
}

// A section's circle "bubbles" (logos / speaker close-ups) split contiguously across its
// pages — page 1 gets the first (slightly larger) half so a lone extra lands up front.
function pageCircles(sectionId: string, pageIndex: number, nPages: number): CollagePhoto[] {
  const all = JOURNEY_CIRCLE_PHOTOS[sectionId]
  if (!all?.length) return []
  const per = Math.ceil(all.length / nPages)
  return all.slice(pageIndex * per, (pageIndex + 1) * per)
}

/**
 * "My Journey — DG Naimish N. Ravani" — a photo album on the SAME framed B5 sheets and
 * navy title banner as every reference page (both untouched). Each chronology section is
 * two pages; the title banner shows on the first page only. Each page's photos are laid
 * out as a curved, interlocking mosaic (see CurvedCollage). Photos are auto-loaded/
 * pre-arranged from /Photos via the generator.
 */
export function MyJourneyPage() {
  // Running sheet index so the recto/verso border frames alternate like a bound book.
  let sheet = 0
  return (
    <ReferenceDoc title="My Journey — DG Naimish N. Ravani">
      {DG_JOURNEY.flatMap((section) => {
        const pages = pagesFor(section)
        return pages.map((page, pi) => {
          const idx = sheet++
          return (
            <ReferencePage
              key={`${section.id}-${pi}`}
              pageIndex={idx}
              title={pi === 0 ? section.title : undefined}
              contentClassName={section.id === 'family' ? 'album album-family' : 'album'}
              noPaginate
            >
              {section.id === 'family' ? (
                <MomentsCollage photos={pagePhotos(page)} />
              ) : (
                <CurvedCollage
                  photos={pagePhotos(page)}
                  circles={pageCircles(section.id, pi, pages.length)}
                  smooth={
                    section.id === 'rotary' ||
                    section.id === 'navyug' ||
                    section.id === 'natrutva' ||
                    section.id === 'navoday' ||
                    section.id === 'navodipt'
                  }
                  // Navoday: both pages use the equal-height wave mode (mix of full-width
                  // strips and pairs that fill the sheet). Page 1 also uses centre-dipping
                  // "valley" seams so its bubbles nestle into them.
                  valleyWaves={section.id === 'navoday' && pi === 0}
                  // Navodipt: page 1 uses equal-height mode (fills the sheet top-to-bottom).
                  // Page 2 uses aspect-fit (justified rows, NO crop) — 5 photos as a feature
                  // (7) + pair (5,8) + pair (9,10); the mosaic renders at its natural height
                  // and letterboxes, so every photo shows in full with room to breathe.
                  aspectFit={section.id === 'navodipt' && pi === 1}
                />
              )}
            </ReferencePage>
          )
        })
      })}
    </ReferenceDoc>
  )
}
