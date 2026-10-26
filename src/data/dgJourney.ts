// "My Journey — DG Naimish N. Ravani": a photo-album shown from the Rotary
// District 3055 (/about) section. Each chronology section spans a fixed number of
// framed B5 album pages; each page holds a handful of photos laid out Pinterest-
// style (see src/routes/my-journey.tsx + the `.album-*` rules in ReferencePage.css).
//
// PHOTOS ARE ADDED LATER. Until then every page carries placeholder slots so the
// album layout is visible. To drop real photos in: import them at the top of the
// route (or pass URLs) and replace the '' slots — or push more — in the matching
// page array; the masonry re-flows automatically. Keep ~6-8 photos per page.
export interface JourneySection {
  /** Stable key for React + future per-section image wiring. */
  id: string
  /** Shown in the navy title banner on the section's first page. */
  title: string
  /** One array per album page; each holds that page's ordered photo srcs.
   *  An '' slot renders a placeholder tile until a real photo is provided. */
  pages: string[][]
}

// `n` empty placeholder slots for a page whose photos aren't in yet.
const slots = (n: number): string[] => Array.from({ length: n }, () => '')

// Page counts per the brief: 3 pages for DG's Family, 2 pages for every other
// section. Placeholder slot count (6) is the middle of the "6-8 per page" target
// and is trivially adjustable once real photos arrive.
export const DG_JOURNEY: JourneySection[] = [
  { id: 'family', title: "District Governor's Family", pages: [slots(6), slots(6), slots(6)] },
  { id: 'rotary', title: 'Rotary Journey', pages: [slots(6), slots(6)] },
  { id: 'navyug', title: 'Navyug - Sept. 2025', pages: [slots(6), slots(6)] },
  { id: 'natrutva', title: 'Natrutva - May 2026', pages: [slots(6), slots(6)] },
  { id: 'navoday', title: 'Navoday - June 2026', pages: [slots(6), slots(6)] },
  { id: 'navodipt', title: 'Navodipt - July 2026', pages: [slots(6), slots(6)] },
]
