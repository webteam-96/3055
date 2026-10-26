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
      { label: 'DLF', page: 6 },
      { label: 'Editorial', page: 7 },
      { label: 'Trustee 2026-30 Venkatesh', page: 8 },
      { label: 'RI Director K.P. Nagesh', page: 9 },
      { label: 'RI Director MMM', page: 10 },
      { label: 'RIDE Zone 4&7', page: 11 },
      { label: 'RIDE Zone 5&6', page: 12 },
      { label: 'DLF Message', page: 13 },
      { label: 'DGE', page: 14 },
      { label: 'DGN', page: 15 },
      { label: 'DRRs', page: 16 },
      { label: 'IWSC', page: 17 },
      { label: 'Rotary Leaders from Zone 4', page: 18 },
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

/** One framed sheet's worth of index rows. `startNo` is the top-level Sr. No. the
 *  first entry in this slice should carry, so numbering stays continuous when the
 *  index spans more than one sheet. Sub-entries use Roman numerals under each parent. */
function IndexTable({ entries, startNo }: { entries: IndexEntry[]; startNo: number }) {
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
                <td className="ix-page">{e.page}</td>
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
                  <td className="ix-page">{c.page}</td>
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

export function IndexPage() {
  const page1 = INDEX_ENTRIES.slice(0, INDEX_SPLIT)
  const page2 = INDEX_ENTRIES.slice(INDEX_SPLIT)
  return (
    <ReferenceDoc title="Index">
      <ReferencePage pageIndex={0} title="INDEX" contentClassName="index" noPaginate>
        <IndexTable entries={page1} startNo={1} />
      </ReferencePage>
      <ReferencePage pageIndex={1} contentClassName="index" noPaginate>
        <IndexTable entries={page2} startNo={INDEX_SPLIT + 1} />
      </ReferencePage>
    </ReferenceDoc>
  )
}
