import { createElement, type ReactElement } from 'react'
import { ReferenceTitlePage } from '../../components/ReferencePage'
import { subtitleForTitle } from '../../data/committeeTaglines'
import type { CombinedDoc } from './downloadCombinedPdf'

/**
 * The client's ordered list of MAIN committee titles (the "separators"), taken from
 * the District Directory format sheet. In the directory "Download All (PDF)", the
 * committee section is rendered STRICTLY in this order and set: each title gets its
 * own title page (forced onto a right-hand / recto page), followed by that committee
 * rendered exactly like its individual print — the committee's own members and then
 * its sub-committees, flowing continuously with no page break between them.
 *
 * ONLY the titles listed here are downloaded. A committee returned by the API but not
 * listed here is excluded; a title listed here with no matching content is skipped and
 * logged (see the `[separators]` console diagnostic) so it can be reported/mapped.
 * Wording is verbatim from the sheet (shown uppercased on the title page).
 */
export const SEPARATOR_TITLES: string[] = [
  'Council of Governors',
  'District Guiding Force',
  'District Secretariat',
  'DLF',
  'District Finance Committee',
  'District Directory Committee',
  "GML - Governor's Monthly Letter Committee",
  'RI District 3051 Service Trust',
  'District Special Projects',
  'Rotary Priority',
  'The Rotary Foundation - RIY',
  'Public Image',
  'Service Projects',
  'Peace Building & Conflict Prevention',
  'Disease Prevention & Treatment',
  'Water Sanitation & Hygiene',
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
  // Included after the district committees, before the clubs (per the client's order).
  // "Regional Co-ordinators" matches the API's "Regional coordinators" group (renamed
  // in selectCategories); "Zonal Teams" matches the API's "Zonal Team" group.
  'Regional Co-ordinators',
  'Zonal Teams',
]

// Display wording on the title page when it should differ from the sheet's shorthand.
const TITLE_DISPLAY: Record<string, string> = {}

// Optional hard-coded overrides: sheet title -> exact API committee name, for cases
// the fuzzy matcher misses. Fill in from the console diagnostic when needed.
const TITLE_TO_GROUP: Record<string, string> = {}

const COVER_SETTLE = 350
const DIR_SETTLE = 250

/** A committee (API) or static-page document, with the name used to match it to a
 *  sheet title (committee: the API groupName; static: the sheet title it fulfils). */
export interface NamedDoc {
  name: string
  element: ReactElement
  settleMs?: number
}

// Normalise a title/committee name for fuzzy comparison: lowercase, expand '&', drop
// punctuation, and remove only the truly generic words ("committee"/"sub") — NOT
// "district"/"rotary"/"priority", which distinguish e.g. "District Priority" from
// "Rotary Priority".
function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(committee|committees|sub)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): Set<string> {
  return new Set(norm(s).split(' ').filter(Boolean))
}

// Jaccard token overlap — catches abbreviation differences (e.g. "…- RIY" vs "(TRF)").
function jaccard(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (!ta.size || !tb.size) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  return inter / (ta.size + tb.size - inter)
}

// Initials of the multi-word side, e.g. "District Learning Facilitator" → "dlf".
function initials(s: string): string {
  const t = norm(s).split(' ').filter(Boolean)
  return t.length >= 2 ? t.map((w) => w[0]).join('') : ''
}

// True when one side is a bare acronym (2–5 letters) equal to the other's initials,
// catching e.g. "DLF" ↔ "District Learning Facilitator".
function acronymMatch(a: string, b: string): boolean {
  const na = norm(a)
  const nb = norm(b)
  if (/^[a-z]{2,5}$/.test(na) && initials(b) === na) return true
  if (/^[a-z]{2,5}$/.test(nb) && initials(a) === nb) return true
  return false
}

function isMatch(title: string, name: string): boolean {
  const a = norm(title)
  const b = norm(name)
  if (!a || !b) return false
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true
  if (acronymMatch(title, name)) return true
  return jaccard(title, name) >= 0.5
}

function titlePage(title: string): CombinedDoc {
  const shown = TITLE_DISPLAY[title] ?? title
  // Client-supplied short description under the title (20px); undefined titles render none.
  const subtitle = subtitleForTitle(title)
  return {
    label: `Title — ${shown}`,
    element: createElement(ReferenceTitlePage, { title: shown.toUpperCase(), subtitle, pageIndex: 0 }),
    settleMs: COVER_SETTLE,
    startOnRight: true,
    isTitlePage: true,
  }
}

/**
 * Build the ordered directory documents from the sheet: for each sheet title, in
 * order, a recto title page followed by the matching content — a static page (matched
 * by exact title, e.g. COGs → Council of Governors) or an API committee (matched
 * fuzzily). Only sheet titles are emitted; unmatched titles and unlisted committees
 * are logged, never added.
 */
export function buildSeparatedDocs(committees: NamedDoc[], statics: NamedDoc[] = []): CombinedDoc[] {
  const out: CombinedDoc[] = []
  const usedStatic = new Set<number>()
  const usedCommittee = new Set<number>()
  const unmatched: string[] = []

  for (const title of SEPARATOR_TITLES) {
    // 1) Static page mapped to this exact sheet title (e.g. COGs → Council of Governors).
    const si = statics.findIndex((s, i) => !usedStatic.has(i) && norm(s.name) === norm(title))
    if (si >= 0) {
      usedStatic.add(si)
      out.push(titlePage(title), { label: title, element: statics[si].element, settleMs: statics[si].settleMs ?? DIR_SETTLE })
      continue
    }
    // 2) API committee — forced override, else fuzzy match, first unused wins.
    const forced = TITLE_TO_GROUP[title]
    const ci = committees.findIndex(
      (c, i) => !usedCommittee.has(i) && ((forced && norm(c.name) === norm(forced)) || isMatch(title, c.name)),
    )
    if (ci >= 0) {
      usedCommittee.add(ci)
      out.push(titlePage(title), { label: title, element: committees[ci].element, settleMs: committees[ci].settleMs ?? DIR_SETTLE })
      continue
    }
    unmatched.push(title)
  }

  const dropped = committees.filter((_, i) => !usedCommittee.has(i)).map((c) => c.name)
  if (unmatched.length || dropped.length) {
    console.info(
      '[separators] sheet titles NOT found (skipped — no matching content):',
      unmatched,
      '\n[separators] API committees NOT in the sheet (excluded):',
      dropped,
    )
  }
  return out
}
