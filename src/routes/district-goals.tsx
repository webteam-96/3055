import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect, useRef, useState } from 'react'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import { DISTRICT_GOAL_TABLES } from '../data/districtGoals'

export const Route = createFileRoute('/district-goals')({
  component: DistrictGoalsPage,
})

// B5 sheet geometry (mirrors ReferencePage / the RI South Asia Office page) so the
// goals table can be split by ROW and fill every sheet continuously — the column
// header repeats on each sheet.
const SHEET_ASPECT = 697.32 / 527.24
const CONTENT_FRACTION = 1 - 0.12 - 0.08
const FILL = 0.98

type Row =
  | { kind: 'ttitle'; text: string }
  | { kind: 'section'; text: string }
  | { kind: 'item'; sr: string; particulars: string; goal: string; alt: boolean }

/** Flatten every table → title band, section band, item rows (item rows tagged for
 *  the zebra stripe; band rows don't participate). */
function buildRows(): Row[] {
  const rows: Row[] = []
  let alt = false
  for (const t of DISTRICT_GOAL_TABLES) {
    rows.push({ kind: 'ttitle', text: t.title })
    for (const s of t.sections) {
      rows.push({ kind: 'section', text: s.band })
      for (const it of s.items) {
        alt = !alt
        rows.push({ kind: 'item', sr: it.sr, particulars: it.particulars, goal: it.goal, alt })
      }
    }
  }
  return rows
}

const COLGROUP = (
  <colgroup>
    <col className="dg-c-sr" />
    <col className="dg-c-part" />
    <col className="dg-c-goal" />
  </colgroup>
)
const HEAD_ROW = (
  <tr>
    <th>Sr. No.</th>
    <th>Particulars</th>
    <th>Goal</th>
  </tr>
)

function renderRow(row: Row, i: number) {
  if (row.kind === 'ttitle')
    return (
      <tr key={i} className="dg-ttitle">
        <td colSpan={3}>{row.text}</td>
      </tr>
    )
  if (row.kind === 'section')
    return (
      <tr key={i} className="dg-section">
        <td colSpan={3}>{row.text}</td>
      </tr>
    )
  return (
    <tr key={i} className={`dg-item${row.alt ? ' dg-alt' : ''}`}>
      <td className="dg-sr">{row.sr}</td>
      <td className="dg-part">{row.particulars}</td>
      <td className="dg-goal">{row.goal}</td>
    </tr>
  )
}

/** District Goals — the district's goals & AOP targets (from District Goals.xlsx).
 *  Same framed B5 sheet, banner and table styling as the RI South Asia Office page;
 *  the table flows continuously across sheets, split at row boundaries. */
export function DistrictGoalsPage() {
  const rows = buildRows()
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
      // Sheet 1 reserves the title banner (everything above the first row); every
      // continuation sheet reserves just the repeated column header.
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
      // Never strand a title/section band at the very bottom of a sheet — push any
      // trailing band(s) to the next sheet so a heading always has rows under it.
      for (let p = 0; p < out.length - 1; p++) {
        while (out[p].length && rows[out[p][out[p].length - 1]].kind !== 'item') {
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
    <ReferenceDoc title="District Goals" pdfName="District Goals — Rotary District 3055">
      {pages.map((idxs, i) => (
        <ReferencePage key={i} pageIndex={i} title={i === 0 ? 'DISTRICT GOALS' : undefined} contentClassName="dg" noPaginate>
          <table className="dg-table">
            {COLGROUP}
            <thead>{HEAD_ROW}</thead>
            <tbody>{idxs.map((ri) => renderRow(rows[ri], ri))}</tbody>
          </table>
        </ReferencePage>
      ))}

      {/* Hidden probe — the full table at the real sheet width, so the header and
          every row can be measured before the row-split. */}
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
          className="ref-content dg"
          ref={contentRef}
          style={
            { position: 'static', width: '85%', height: 'auto', bottom: 'auto', '--ref-base': '1.8014cqw' } as React.CSSProperties
          }
        >
          <div className="ref-title">DISTRICT GOALS</div>
          <table className="dg-table" ref={tableRef}>
            {COLGROUP}
            <thead>{HEAD_ROW}</thead>
            <tbody ref={tbodyRef}>{rows.map((r, i) => renderRow(r, i))}</tbody>
          </table>
        </div>
      </div>
    </ReferenceDoc>
  )
}
