import { Fragment } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'

export const Route = createFileRoute('/contents')({
  component: IndexPage,
})

// Rough index / table of contents for the directory. Entries and page numbers are
// PLACEHOLDERS — the client will finalise the wording and real page numbers. Sub-
// entries are numbered decimally under their parent (e.g. 3.1, 3.2). Each entry
// carries a dummy `page`; edit these here when the layout is finalised.
// Sub-entries are numbered with lowercase Roman numerals (i, ii, iii …), restarting
// under each parent section.
function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ]
  let out = ''
  for (const [value, sym] of map) {
    while (num >= value) {
      out += sym
      num -= value
    }
  }
  return out
}

interface IndexChild {
  label: string
  page: number
}
interface IndexEntry {
  label: string
  page: number
  children?: IndexChild[]
}

const INDEX_ENTRIES: IndexEntry[] = [
  { label: 'My Journey - DG Naimish N Ravani', page: 1 },
  { label: 'Pictures of fellowship AGLS/DOLS/PELS/CLLS', page: 2 },
  {
    label: 'Our Leaders: Profiles & Messages',
    page: 3,
    children: [
      { label: 'RI President', page: 4 },
      { label: 'DG', page: 5 },
      { label: 'Editorial', page: 6 },
      { label: 'Trustee 2026-30 Venkatesh', page: 7 },
      { label: 'RI Director K.P. Nagesh', page: 8 },
      { label: 'RI Director MMM', page: 9 },
      { label: 'RIDE Zone 4&7', page: 10 },
      { label: 'RIDE Zone 5&6', page: 11 },
      { label: 'DLF Message', page: 12 },
      { label: 'DGE', page: 13 },
      { label: 'DGN', page: 14 },
      { label: 'DRRs', page: 15 },
      { label: 'IWSC', page: 16 },
      { label: 'Rotary Leaders from Zone 4', page: 17 },
    ],
  },
  { label: 'Rotary Club Of Supreme', page: 19 },
  { label: 'Council of Governors', page: 20 },
  { label: 'District Guiding Force', page: 21 },
  { label: 'District Secretariat', page: 22 },
  { label: 'DLF', page: 23 },
  { label: 'District Finance Committee', page: 24 },
  { label: 'District Directory Committee', page: 25 },
  { label: "GML - Governor's Monthly Letter Committee", page: 26 },
  { label: 'RI District 3051 Service Trust', page: 27 },
  { label: 'District Special Projects', page: 28 },
  { label: 'Rotary Priority', page: 29 },
  { label: 'The Rotary Foundation - RIY', page: 30 },
  { label: 'Public Image', page: 31 },
  { label: 'Service Projects', page: 32 },
  { label: 'Peace Building & Conflict Prevention', page: 33 },
  { label: 'Disease Prevention & Treatment', page: 34 },
  { label: 'Water Sanitation & Hygiene', page: 35 },
  { label: 'Basic Education & Literacy - BEL', page: 36 },
  { label: 'Maternal & Child Health', page: 37 },
  { label: 'Economic Community Development', page: 38 },
  { label: 'Environment', page: 39 },
  { label: 'Club Service', page: 40 },
  { label: 'Vocational Service', page: 41 },
  { label: 'Community Service', page: 42 },
  { label: 'International Service', page: 43 },
  { label: 'Youth Service', page: 44 },
  { label: 'District Priority', page: 45 },
  { label: 'District Core Committees', page: 46 },
  { label: 'District Other Important Committees', page: 47 },
  { label: 'Zonal Teams', page: 48 },
  { label: 'Rotary Clubs of District 3055', page: 49 },
  {
    label: 'Club Tool-Kit',
    page: 50,
    children: [
      { label: "RI President's Club & excellence awards", page: 51 },
      { label: 'District Goals', page: 52 },
      { label: 'DG Club Excellence Award', page: 53 },
      { label: 'RI Awards & Recognition', page: 54 },
      { label: 'Rotary Protocol & Decorum', page: 55 },
      { label: 'District Events', page: 56 },
      { label: 'Donors from RI District 3055', page: 57 },
      { label: 'Rotary International South Asia Office', page: 58 },
      { label: 'Club Financials', page: 59 },
    ],
  },
  {
    label: 'Rotary Information',
    page: 60,
    children: [
      { label: "ROTARY'S TIMELINE", page: 61 },
      { label: 'THE ROTARY FOUNDATION MILESTONES', page: 62 },
      { label: 'ROTARY IN INDIA', page: 63 },
      { label: 'WOMEN IN ROTARY', page: 64 },
      { label: 'ROTARY ACRONYMS', page: 65 },
      { label: 'ROTARY DESIGNATED MONTHS', page: 66 },
      { label: 'OATHS: PRESIDENT/SECRETARY & NEW MEMBERS', page: 67 },
    ],
  },
  { label: 'District Governors: Zone 4,5,6 & 7', page: 68 },
  { label: 'DOBs', page: 69 },
  { label: 'Bibliography', page: 70 },
]

// ---------------------------------------------------------------------------
// Real page numbers. In the master "Download Everything" export the book records the actual
// page each section starts on (keyed by a normalized section name); here we look each TOC
// entry up in that map so the "Page No." column shows the real page instead of a placeholder.
// A few entries are worded differently from the section/document name, so they alias to it.
// Entries that can't be matched show a dash. When no map is supplied (the live /contents
// route) the hardcoded placeholder `page` is shown as before.
// ---------------------------------------------------------------------------
export type PageMap = Record<string, number>

export function tocKey(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
}

// TOC label (keyed) → the section/document name it should resolve to (keyed).
const TOC_ALIASES: Record<string, string> = {
  [tocKey('Our Leaders: Profiles & Messages')]: tocKey('Profile & Message'),
  [tocKey('Zonal Teams')]: tocKey('Zonal Team'),
  [tocKey("RI President's Club & excellence awards")]: tocKey("RI President's Club Excellence Award"),
  // "Club Tool-Kit" has no opener doc of its own — point it at its first built item.
  [tocKey('Club Tool-Kit')]: tocKey("RI President's Club Excellence Award"),
  // Profile & Message leaders: the Index uses a role label, but each person's document is
  // labelled by NAME — alias role → name so the TOC shows that person's real start page.
  // "DLF Message" (NOT "DLF") keys J.P. Vyas so it doesn't collide with the DLF committee.
  [tocKey('RI President')]: tocKey('Olayinka Hakeem Babalola'),
  [tocKey('DG')]: tocKey('Naimish N. Ravani'),
  [tocKey('Editorial')]: tocKey('Rtn. Dr. Geetika Saluja'),
  [tocKey('Trustee 2026-30 Venkatesh')]: tocKey('Rtn. A.S. Venkatesh (Venky)'),
  [tocKey('RI Director K.P. Nagesh')]: tocKey('K. P. Nagesh'),
  [tocKey('RI Director MMM')]: tocKey('Muruganandam M'),
  [tocKey('RIDE Zone 4&7')]: tocKey('Gurjeet S. Sekhon'),
  [tocKey('RIDE Zone 5&6')]: tocKey('Basu Dev Golyan'),
  [tocKey('DLF Message')]: tocKey('Rtn. Dr. J. P. Vyas'),
  [tocKey('DGE')]: tocKey('Rtn. K.A. Shyam Kumar'),
  [tocKey('DGN')]: tocKey('Rtn. Vikram Thakkar'),
  [tocKey('DRRs')]: tocKey('PHF Rtr. Aneri Bhatt'),
  [tocKey('IWSC')]: tocKey('Varsha Bhavesh Shah'),
}

/** The real page for a TOC label from the collected map (via alias then direct key), or null. */
function resolvePage(label: string, map?: PageMap): number | null {
  if (!map) return null
  const k = tocKey(label)
  const page = map[TOC_ALIASES[k] ?? k] ?? map[k]
  return typeof page === 'number' && page > 0 ? page : null
}

/** The value shown in the Page No. column: the real page (from the map), the dash when the
 *  map is present but this entry couldn't be matched, or the placeholder when there's no map. */
function pageCell(label: string, placeholder: number, map?: PageMap): string | number {
  if (!map) return placeholder
  const p = resolvePage(label, map)
  return p ?? '—'
}

/** One framed sheet's worth of index rows. `startNo` is the top-level Sr. No. the
 *  first entry in this slice should carry, so numbering stays continuous when the
 *  index spans more than one sheet. Sub-entries use Roman numerals under each parent. */
function IndexTable({ entries, startNo, pageMap }: { entries: IndexEntry[]; startNo: number; pageMap?: PageMap }) {
  return (
    <table className="index-table">
      <colgroup>
        <col className="ix-c-sr" />
        <col className="ix-c-content" />
        <col className="ix-c-page" />
      </colgroup>
      <thead>
        <tr>
          <th className="ix-sr">Sr. No.</th>
          <th className="ix-content">Contents</th>
          <th className="ix-page">Page No.</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, i) => {
          const n = startNo + i
          return (
            <Fragment key={i}>
              <tr className="ix-row ix-top">
                <td className="ix-sr">{n}</td>
                <td className="ix-content">
                  <span className="ix-cwrap">
                    <span className="ix-label">{e.label}</span>
                    <span className="ix-dots" aria-hidden="true" />
                  </span>
                </td>
                <td className="ix-page">{pageCell(e.label, e.page, pageMap)}</td>
              </tr>
              {e.children?.map((c, j) => (
                <tr className="ix-row ix-sub" key={j}>
                  <td className="ix-sr">{toRoman(j + 1)}</td>
                  <td className="ix-content">
                    <span className="ix-cwrap">
                      <span className="ix-label">{c.label}</span>
                      <span className="ix-dots" aria-hidden="true" />
                    </span>
                  </td>
                  <td className="ix-page">{pageCell(c.label, c.page, pageMap)}</td>
                </tr>
              ))}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

/** Directory Index — a borderless contents table (Sr. No. | Contents | Page No.)
 *  with dotted leaders and Roman-numeral sub-entries. The full list is taller than
 *  one B5 sheet, so it's split across two framed reference sheets at a top-level
 *  boundary; Sr. No. runs continuously and the recto/verso frames alternate like a
 *  bound book. Page numbers are placeholders until the layout is finalised. */
const INDEX_SPLIT = 21 // entries[0..20] on sheet 1, the rest on sheet 2

// Index entries hidden because their section isn't built yet (e.g. "Pictures of fellowship")
// or is a sub-section INSIDE one document whose internal pages aren't separately tracked (all
// of Rotary Information, some Club Tool-Kit items) — they would otherwise show a "—" in the
// master export's real-page Index. Keyed by tocKey. Remove a label from here once its section
// is built / its page is tracked, and it reappears automatically. Filtered in BOTH index
// renders (placeholder pass + real-page overdraw) so the sheet counts still match.
const INDEX_PENDING = new Set(
  [
    'Pictures of fellowship AGLS/DOLS/PELS/CLLS',
    'DG Club Excellence Award',
    'RI Awards & Recognition',
    'District Events',
    'Club Financials',
    "ROTARY'S TIMELINE",
    'THE ROTARY FOUNDATION MILESTONES',
    'ROTARY IN INDIA',
    'WOMEN IN ROTARY',
    'ROTARY ACRONYMS',
    'ROTARY DESIGNATED MONTHS',
    'OATHS: PRESIDENT/SECRETARY & NEW MEMBERS',
  ].map(tocKey),
)

export function IndexPage({ pageMap }: { pageMap?: PageMap } = {}) {
  // Drop hidden (pending) entries and sub-entries so no unresolved "—" rows appear; Sr. No.
  // then runs continuously over what remains.
  const visible = INDEX_ENTRIES.filter((e) => !INDEX_PENDING.has(tocKey(e.label))).map((e) =>
    e.children ? { ...e, children: e.children.filter((c) => !INDEX_PENDING.has(tocKey(c.label))) } : e,
  )
  const page1 = visible.slice(0, INDEX_SPLIT)
  const page2 = visible.slice(INDEX_SPLIT)
  return (
    <ReferenceDoc title="Index">
      <ReferencePage pageIndex={0} title="INDEX" contentClassName="index" noPaginate>
        <IndexTable entries={page1} startNo={1} pageMap={pageMap} />
      </ReferencePage>
      <ReferencePage pageIndex={1} contentClassName="index" noPaginate>
        <IndexTable entries={page2} startNo={INDEX_SPLIT + 1} pageMap={pageMap} />
      </ReferencePage>
    </ReferenceDoc>
  )
}
