import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect, useRef, useState } from 'react'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import { RI_SAO_DEPARTMENTS, RI_SAO_OFFICE, type RiSaoDept } from '../data/riSouthAsiaOffice'

export const Route = createFileRoute('/ri-south-asia-office')({
  component: RiSouthAsiaOfficePage,
})

// B5 sheet geometry (mirrors ReferencePage) so the staff table can be split by ROW
// and fill every sheet continuously — the column header repeats on each sheet and
// the office-info block sits on the first. A hair under ReferencePage's own fill
// factor so the slices we hand it never trigger a second split.
const SHEET_ASPECT = 697.32 / 527.24
const CONTENT_FRACTION = 1 - 0.12 - 0.08
// Fill almost the whole safe area (ReferencePage no longer re-paginates our slices,
// so we pack right up to the bottom margin, leaving just a hair above the curve).
const FILL = 0.98

type Row =
  | { kind: 'dept'; dept: string }
  | { kind: 'person'; name: string; designation: string; phone: string; email: string; alt: boolean }

/** Flatten all departments into table rows, tagging alternate person rows for the
 *  zebra stripe (department band rows don't participate). */
function buildRows(depts: RiSaoDept[]): Row[] {
  const rows: Row[] = []
  let alt = false
  for (const d of depts) {
    if (d.dept) rows.push({ kind: 'dept', dept: d.dept })
    for (const p of d.people) {
      alt = !alt
      rows.push({ kind: 'person', name: p.name, designation: p.designation, phone: p.phone, email: p.email, alt })
    }
  }
  return rows
}

function OfficeInfo() {
  return (
    <div className="riso-info">
      <p>
        <b>Office Address:</b> {RI_SAO_OFFICE.address}
      </p>
      <p>
        <b>Telephone Nos.:</b> {RI_SAO_OFFICE.phones}
      </p>
      <p className="riso-hours">
        Office Timings: {RI_SAO_OFFICE.timings}
        <br />
        {RI_SAO_OFFICE.openNote}
      </p>
    </div>
  )
}

const COLGROUP = (
  <colgroup>
    <col className="riso-c-name" />
    <col className="riso-c-desg" />
    <col className="riso-c-tel" />
    <col className="riso-c-mail" />
  </colgroup>
)
const HEAD_ROW = (
  <tr>
    <th>Name</th>
    <th>Designation</th>
    <th>Tel. (Direct)</th>
    <th>E-mail</th>
  </tr>
)

function renderRow(row: Row, i: number) {
  return row.kind === 'dept' ? (
    <tr key={i} className="riso-dept">
      <td colSpan={4}>{row.dept}</td>
    </tr>
  ) : (
    <tr key={i} className={`riso-person${row.alt ? ' riso-alt' : ''}`}>
      <td className="riso-name">{row.name}</td>
      <td className="riso-desg">{row.designation}</td>
      <td className="riso-tel">{row.phone}</td>
      <td className="riso-mail">{row.email}</td>
    </tr>
  )
}

/** Rotary International South Asia Office — staff directory (source pp. 9–11). The
 *  table flows continuously across B5 sheets, split at row boundaries. */
export function RiSouthAsiaOfficePage() {
  const rows = buildRows(RI_SAO_DEPARTMENTS)
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
      // Sheet 1 reserves the title banner + office-info + column header (everything
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
      // Never strand a department band at the very bottom of a sheet.
      for (let p = 0; p < out.length - 1; p++) {
        while (out[p].length && rows[out[p][out[p].length - 1]].kind === 'dept') {
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
    <ReferenceDoc title="Rotary International South Asia Office" pdfName="RI South Asia Office — Rotary District 3055">
      {pages.map((idxs, i) => (
        <ReferencePage
          key={i}
          pageIndex={i}
          title={i === 0 ? 'ROTARY INTERNATIONAL SOUTH ASIA OFFICE' : undefined}
          contentClassName="riso"
          noPaginate
        >
          {i === 0 && <OfficeInfo />}
          <table className="riso-table">
            {COLGROUP}
            <thead>{HEAD_ROW}</thead>
            <tbody>{idxs.map((ri) => renderRow(rows[ri], ri))}</tbody>
          </table>
        </ReferencePage>
      ))}

      {/* Hidden probe — office-info + the full table at the real sheet width, so the
          header, info block and every row can be measured before the row-split. */}
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
          className="ref-content riso"
          ref={contentRef}
          style={
            { position: 'static', width: '85%', height: 'auto', bottom: 'auto', '--ref-base': '1.8014cqw' } as React.CSSProperties
          }
        >
          <div className="ref-title">ROTARY INTERNATIONAL SOUTH ASIA OFFICE</div>
          <OfficeInfo />
          <table className="riso-table" ref={tableRef}>
            {COLGROUP}
            <thead>{HEAD_ROW}</thead>
            <tbody ref={tbodyRef}>{rows.map((r, i) => renderRow(r, i))}</tbody>
          </table>
        </div>
      </div>
    </ReferenceDoc>
  )
}
