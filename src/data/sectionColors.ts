// Per-section sheet background tints for the printed / PDF directory.
//
// Every framed print sheet used to sit on the border artwork's baked-in cream
// (#F9F2EA). The border SVGs now have a TRANSPARENT interior, so each sheet's own
// background colour shows through — letting us give each book SECTION its own light
// tint while keeping ONE pair of frame SVGs. The colours below are all as light as
// the original cream, just different hues, so dark navy/brown text stays legible.
//
// A page that belongs to no listed section keeps the original cream
// (DEFAULT_SHEET_BG), so unmapped/nav pages are visually unchanged.
//
// The 11 sections are the client's printed-book sections (see the index / contents):
//  1 Front matter (Founder, RI President Message & Theme, Zones & Districts, Index)
//  2 My Journey · Pictures of fellowship
//  3 Our Leaders: Profiles & Messages · Rotary Club of Supreme
//  4 Council of Governors
//  5 District administrative committees (Guiding Force … RI District 3051 Service Trust)
//  6 District Special Projects … District Other Important Committees (avenues/focus)
//  7 Zonal Teams (incl. Assistant Governors)
//  8 Rotary Clubs of District 3055
//  9 Club Tool-Kit
// 10 Rotary Information
// 11 District Governors: Zone 4,5,6 & 7

export const DEFAULT_SHEET_BG = '#F9F2EA'

// Light tints, one per section. Neighbours alternate warm/cool so adjacent sections
// in reading order read as clearly different.
export const SECTION_BG: Record<number, string> = {
  1: '#F4E9E9', // warm rose
  2: '#E9F1EB', // cool green
  3: '#F5EEE1', // warm sand
  4: '#E7EFF5', // cool blue
  5: '#FAEDE3', // warm peach
  6: '#ECEBF5', // cool lavender
  7: '#F2F1E4', // warm ivory
  8: '#E6F1EE', // cool mint
  9: '#EDEDEF', // neutral grey
  10: '#F5EAF0', // warm mauve
  11: '#E8EEF2', // cool slate
}

// Committee / group names (as they appear in the API `groupName`, the sheet's
// separator titles, and the URL `?name=` param) grouped by section. Both the sheet
// wording and the API spelling variants are listed so a match is found from any path
// (e.g. "DLF" vs "District Learning Facilitator Team (DLF)"; the API's "Hygine"
// misspelling vs the sheet's "Hygiene").
const SECTION_COMMITTEES: Record<number, string[]> = {
  4: ['Council of Governors', 'COGs'],
  5: [
    'District Guiding Force',
    'District Secretariat',
    'DLF',
    'District Learning Facilitator Team (DLF)',
    'District Finance Committee',
    'District Directory Committee',
    "GML - Governor's Monthly Letter Committee",
    'RI District 3051 Service Trust',
  ],
  6: [
    'District Special Projects',
    'Rotary Priority',
    'The Rotary Foundation - RIY',
    'Public Image',
    'Service Projects',
    'Peace Building & Conflict Prevention',
    'Disease Prevention & Treatment',
    'Water Sanitation & Hygiene',
    'Water Sanitation & Hygine',
    'Basic Education & Literacy - BEL',
    'Maternal & Child Health',
    'Economic Community Development',
    'Environment',
    'Club Service',
    'Vocational Service',
    'Community Service',
    'International Service',
    'Youth Service',
    'District Priority',
    'District Core Committees',
    'District Other Important Committees',
  ],
  7: [
    'Zonal Team',
    'Zonal Teams',
    'Assistant Governors',
    'Assistant Governors (Zone wise)',
    // Regional Co-ordinators shares the Zonal Team's section background (per request).
    // Both spellings normalise identically; listed for clarity.
    'Regional coordinators',
    'Regional Co-ordinators',
    // The Download-All combines Regional Co-ordinators + Zonal Teams under one title page.
    'Regional Coordinators, Assistant Governors & Zone Leaders',
  ],
}

// Fixed page → section map (routes whose section does not depend on data).
const PATH_SECTION: Record<string, number> = {
  '/founder': 1,
  '/message-and-theme': 1,
  '/zones-districts': 1,
  '/contents': 1,
  '/my-journey': 2,
  '/message': 3,
  '/message-details': 3,
  '/rotary-leaders-zone4': 3,
  '/rotary-club-supreme': 3,
  '/council-of-governors': 4,
  '/ag-directory': 7,
  '/bod': 8,
  '/club-details': 8,
  '/district-goals': 9,
  '/club-excellence-award': 9,
  '/rotary-protocol': 9,
  '/donors': 9,
  '/ri-south-asia-office': 9,
  '/rotary-information': 10,
  '/dg-other-districts': 11,
}

const normName = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')

const COMMITTEE_TO_SECTION = new Map<string, number>()
for (const [sec, names] of Object.entries(SECTION_COMMITTEES)) {
  for (const n of names) COMMITTEE_TO_SECTION.set(normName(n), Number(sec))
}

/** The section number for a committee / group name (API groupName, separator title,
 *  or `?name=` value), or null when it belongs to none. */
export function sectionForCommitteeName(name: string): number | null {
  if (!name) return null
  const sec = COMMITTEE_TO_SECTION.get(normName(name))
  return sec ?? null
}

/** The section number for a live route (pathname + parsed search), or null (default).
 *  Committee views (`/sub-committee`, `/committee-details`) resolve by their parent
 *  committee name, since a sub-committee inherits its committee's section. */
export function sectionForRoute(pathname: string, search?: Record<string, unknown>): number | null {
  const p = (pathname || '').replace(/\/+$/, '') || '/'
  if (p in PATH_SECTION) return PATH_SECTION[p]
  if (p === '/sub-committee' || p === '/committee-details') {
    const name = String((search?.name ?? '') as string)
    return sectionForCommitteeName(name)
  }
  return null
}

/** The sheet background colour for a section number (or the default cream). */
export function sheetBgForSection(section: number | null): string {
  return section != null ? (SECTION_BG[section] ?? DEFAULT_SHEET_BG) : DEFAULT_SHEET_BG
}

/** The sheet background colour for a live route. */
export function sheetBgForRoute(pathname: string, search?: Record<string, unknown>): string {
  return sheetBgForSection(sectionForRoute(pathname, search))
}

/** The sheet background colour for a committee / separator title (used by the PDF
 *  builders). Accepts a `Title — X` separator label and the bare committee name. */
export function sheetBgForCommitteeName(name: string): string {
  const bare = (name || '').replace(/^Title\s*[—–-]\s*/, '')
  return sheetBgForSection(sectionForCommitteeName(bare))
}
