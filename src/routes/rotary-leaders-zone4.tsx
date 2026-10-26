import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect, useRef, useState } from 'react'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import { ZONE4_AREAS, type Zone4Area } from '../data/zone4Leaders'

export const Route = createFileRoute('/rotary-leaders-zone4')({
  component: RotaryLeadersZone4Page,
})

// B5 sheet geometry (mirrors ReferencePage / the RI South Asia Office page) so
// the leaders table can be split by ROW and fill every sheet continuously — the
// column header repeats on each sheet and the lead-in subtitle sits on the first.
// A hair under ReferencePage's own fill factor so the slices we hand it never
// trigger a second split.
const SHEET_ASPECT = 697.32 / 527.24
const CONTENT_FRACTION = 1 - 0.12 - 0.08
// Fill almost the whole safe area (ReferencePage no longer re-paginates our slices,
// so we pack right up to the bottom margin, leaving just a hair above the curve).
const FILL = 0.98

const SUBTITLE = 'Regional coordinators, advisors & plan leads guiding Rotary’s Action Plan across Zone 4.'

type Row =
  | { kind: 'area'; area: string }
  | { kind: 'role'; title: string; abbrev: string }
  | { kind: 'person'; district: string; name: string; term: string | null; alt: boolean }

/** Flatten the grouped data into table rows, tagging alternating person rows for
 *  the zebra stripe (area/role band rows don't participate). */
function buildRows(areas: Zone4Area[]): Row[] {
  const rows: Row[] = []
  let alt = false
  for (const a of areas) {
    rows.push({ kind: 'area', area: a.area })
    for (const r of a.roles) {
      rows.push({ kind: 'role', title: r.title, abbrev: r.abbrev })
      for (const p of r.people) {
        alt = !alt
        rows.push({ kind: 'person', district: p.district, name: p.name, term: p.term, alt })
      }
    }
  }
  return rows
}

const HEAD_ROW = (
  <tr>
    <th className="rl-dist-h">District</th>
    <th>Name</th>
    <th className="rl-term-h">DG Year</th>
  </tr>
)

function renderRow(row: Row, i: number) {
  if (row.kind === 'area') {
    return (
      <tr key={i} className="rl-area">
        <td colSpan={3}>{row.area}</td>
      </tr>
    )
  }
  if (row.kind === 'role') {
    return (
      <tr key={i} className="rl-role">
        <td colSpan={3}>
          {row.title}
          {row.abbrev ? <span className="rl-abbr"> ({row.abbrev})</span> : null}
        </td>
      </tr>
    )
  }
  return (
    <tr key={i} className={`rl-person${row.alt ? ' rl-alt' : ''}`}>
      <td className="rl-dist">{row.district}</td>
      <td className="rl-name">{row.name}</td>
      <td className="rl-term">{row.term ?? '—'}</td>
    </tr>
  )
}

/** Rotary Leaders from Zone 4 — regional coordinators, advisors and plan leads
 *  (source: rizones45678.org/regional-leaders, Zone 4 Directory). The table flows
 *  continuously across B5 sheets, split at row boundaries so each sheet fills to
 *  the bottom margin at the uniform 1.8014cqw body size. */
export function RotaryLeadersZone4Page() {
  const rows = buildRows(ZONE4_AREAS)
  const count = rows.length
  const [pages, setPages] = useState<number[][]>(() => [Array.from({ length: count }, (_, i) => i)])
  const contentRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const sigRef = useRef('')

  useLayoutEffect(() => {
    const measure = () => {
      const content = contentRef.current
      const table = tableRef.current
      const tbody = tbodyRef.current
      const container = content?.parentElement
      if (!content || !table || !tbody || !container) return
      const width = container.clientWidth
      if (!width) return
      const usable = width * SHEET_ASPECT * CONTENT_FRACTION * FILL
      const top = (el: Element) => el.getBoundingClientRect().top
      const trs = Array.from(tbody.children) as HTMLElement[]
      if (!trs.length) return
      // Sheet 1 reserves the title banner + subtitle + column header (everything
      // above the first row); continuation sheets reserve just the column header.
      const preH = top(trs[0]) - top(content)
      const headH = top(trs[0]) - top(table)
      const rowH = (i: number) => {
        const el = trs[i]
        const next = trs[i + 1]
        return (next ? next.getBoundingClientRect().top : el.getBoundingClientRect().bottom) - el.getBoundingClientRect().top
      }
      const out: number[][] = []
      let cur: number[] = []
      let used = preH
      for (let i = 0; i < count; i++) {
        const h = rowH(i)
        if (used + h > usable && cur.length) {
          out.push(cur)
          cur = []
          used = headH
        }
        cur.push(i)
        used += h
      }
      if (cur.length) out.push(cur)
      // Never strand an area/role band at the very bottom of a sheet — a band is a
      // heading for the rows beneath it, so it must travel with them.
      for (let p = 0; p < out.length - 1; p++) {
        while (out[p].length && rows[out[p][out[p].length - 1]].kind !== 'person') {
          out[p + 1].unshift(out[p].pop() as number)
        }
      }
      const clean = out.filter((g) => g.length)
      const sig = clean.map((g) => `${g[0]}-${g[g.length - 1]}`).join('|')
      if (sig !== sigRef.current) {
        sigRef.current = sig
        setPages(clean.length ? clean : [[]])
      }
    }
    measure()
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
    if (fonts?.ready) fonts.ready.then(measure)
    const t = window.setTimeout(measure, 400)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [count])

  return (
    <ReferenceDoc title="Rotary Leaders from Zone 4" pdfName="Rotary Leaders from Zone 4 — Rotary District 3055">
      {pages.map((idxs, i) => (
        <ReferencePage
          key={i}
          pageIndex={i}
          title={i === 0 ? 'ROTARY LEADERS FROM ZONE 4' : undefined}
          contentClassName="zone4"
          noPaginate
        >
          {i === 0 && <p className="ref-subtitle">{SUBTITLE}</p>}
          <table className="rl-table">
            <thead>{HEAD_ROW}</thead>
            <tbody>{idxs.map((ri) => renderRow(rows[ri], ri))}</tbody>
          </table>
        </ReferencePage>
      ))}

      {/* Hidden probe — subtitle + the full table at the real sheet width, so the
          header, subtitle and every row can be measured before the row-split. */}
      <div
        aria-hidden
        style={
          {
            position: 'absolute',
            left: -100000,
            top: 0,
            visibility: 'hidden',
            width: 'min(700px, 96vw)',
            containerType: 'inline-size',
          } as React.CSSProperties
        }
      >
        <div
          className="ref-content zone4"
          ref={contentRef}
          style={
            { position: 'static', width: '85%', height: 'auto', bottom: 'auto', '--ref-base': '1.8014cqw' } as React.CSSProperties
          }
        >
          <div className="ref-title">ROTARY LEADERS FROM ZONE 4</div>
          <p className="ref-subtitle">{SUBTITLE}</p>
          <table className="rl-table" ref={tableRef}>
            <thead>{HEAD_ROW}</thead>
            <tbody ref={tbodyRef}>{rows.map((r, i) => renderRow(r, i))}</tbody>
          </table>
        </div>
      </div>
    </ReferenceDoc>
  )
}
