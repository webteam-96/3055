import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import { DONOR_SHEETS, type DonorBlock } from '../data/donors'

export const Route = createFileRoute('/donors')({
  component: DonorsPage,
})

const DONOR_COLS = ['Donor', 'Recognition level', 'Achieved Date', 'Rotary Club']
const ENDOW_COLS = ['Donor', 'Gift ID', 'Year', 'Value at Inception']

// B5 sheet geometry (mirrors ReferencePage / the Zone 4 leaders page) so the donor
// table is split by ROW and fills every sheet continuously — the column header
// repeats on each sheet and the title/subtitle sit on the first. A hair under
// ReferencePage's own fill factor so the slices we hand it never re-split.
const SHEET_ASPECT = 697.32 / 527.24
const CONTENT_FRACTION = 1 - 0.12 - 0.08
const FILL = 0.98

const DONOR_COLGROUP = (
  <colgroup>
    <col style={{ width: '27%' }} />
    <col style={{ width: '28%' }} />
    <col style={{ width: '19%' }} />
    <col style={{ width: '26%' }} />
  </colgroup>
)
const ENDOW_COLGROUP = (
  <colgroup>
    <col style={{ width: '46%' }} />
    <col style={{ width: '16%' }} />
    <col style={{ width: '15%' }} />
    <col style={{ width: '23%' }} />
  </colgroup>
)

// ---------------------------------------------------------------------------
// Donor directory table — flattened to rows so it can be packed sheet-by-sheet
// (Zone 4 style). Category bands, donor rows, then the "Endowment & Major Gift"
// band + its own mini-table, all in one continuous flow.
// ---------------------------------------------------------------------------
type DRow =
  | { kind: 'band'; text: string }
  | { kind: 'donor'; donor: string; level: string; date: string; club: string; alt: boolean }
  | { kind: 'endowBand'; text: string }
  | { kind: 'endowHead' }
  | { kind: 'endow'; donor: string; giftId: string; year: string; value: string; alt: boolean }

/** Flatten the donor-table blocks into rows, tagging alternate donor/endowment rows
 *  for the zebra stripe (band rows don't participate). */
function buildDonorRows(blocks: DonorBlock[]): DRow[] {
  const rows: DRow[] = []
  let dAlt = false
  let eAlt = false
  for (const b of blocks) {
    switch (b.kind) {
      case 'groupHeader':
        if (b.text === 'Endowment & Major Gift') {
          rows.push({ kind: 'endowBand', text: b.text })
        } else {
          rows.push({ kind: 'band', text: b.text || '' })
        }
        break
      case 'donorRow':
        dAlt = !dAlt
        rows.push({ kind: 'donor', donor: b.donor || '', level: b.level || '', date: b.date || '', club: b.club || '', alt: dAlt })
        break
      case 'endowTableHeader':
        rows.push({ kind: 'endowHead' })
        break
      case 'endowRow':
        eAlt = !eAlt
        rows.push({ kind: 'endow', donor: b.donor || '', giftId: b.giftId || '', year: b.year || '', value: b.value || '', alt: eAlt })
        break
    }
  }
  return rows
}

/** Render one sheet's slice of donor rows, regrouping consecutive rows into the
 *  right table (main donor table with its header repeated per sheet, or the
 *  endowment mini-table). Every measurable row carries data-ri for the probe. */
function renderDonorSheet(indices: number[], rows: DRow[]): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < indices.length) {
    const kind = rows[indices[i]].kind
    if (kind === 'band' || kind === 'donor') {
      const body: ReactNode[] = []
      while (i < indices.length && (rows[indices[i]].kind === 'band' || rows[indices[i]].kind === 'donor')) {
        const g = indices[i]
        const r = rows[g]
        if (r.kind === 'band') {
          body.push(
            <tr className="donor-cat" data-ri={g} key={key++}>
              <td colSpan={4}>{r.text}</td>
            </tr>,
          )
        } else if (r.kind === 'donor') {
          body.push(
            <tr className={`donor-row${r.alt ? ' donor-alt' : ''}`} data-ri={g} key={key++}>
              <td>{r.donor}</td>
              <td>{r.level}</td>
              <td className="donor-c">{r.date}</td>
              <td>{r.club}</td>
            </tr>,
          )
        }
        i++
      }
      out.push(
        <table className="donor-dir" key={key++}>
          {DONOR_COLGROUP}
          <thead>
            <tr>
              {DONOR_COLS.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>,
      )
    } else if (kind === 'endowBand') {
      const r = rows[indices[i]]
      out.push(
        <div className="donor-band" data-ri={indices[i]} key={key++}>
          {r.kind === 'endowBand' ? r.text : ''}
        </div>,
      )
      i++
    } else {
      // endowHead and/or endow rows → the endowment mini-table
      let headIdx: number | null = null
      if (rows[indices[i]].kind === 'endowHead') {
        headIdx = indices[i]
        i++
      }
      const body: ReactNode[] = []
      while (i < indices.length && rows[indices[i]].kind === 'endow') {
        const g = indices[i]
        const r = rows[g]
        if (r.kind === 'endow') {
          body.push(
            <tr className={`donor-row${r.alt ? ' donor-alt' : ''}`} data-ri={g} key={key++}>
              <td>{r.donor}</td>
              <td className="donor-c">{r.giftId}</td>
              <td className="donor-c">{r.year}</td>
              <td className="donor-c">{r.value}</td>
            </tr>,
          )
        }
        i++
      }
      out.push(
        <table className="donor-dir endow-dir" key={key++}>
          {ENDOW_COLGROUP}
          <thead>
            <tr {...(headIdx != null ? { 'data-ri': headIdx } : {})}>
              {ENDOW_COLS.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>,
      )
    }
  }
  return out
}

const HEADERISH = new Set(['band', 'endowBand', 'endowHead'])

/** The donor directory table, dynamically paginated across B5 sheets so each sheet
 *  fills to the bottom margin at the uniform (Zone 4) body size. */
function DonorDirectory({ blocks, subtitle }: { blocks: DonorBlock[]; subtitle: string | null }) {
  const rows = buildDonorRows(blocks)
  const count = rows.length
  const [pages, setPages] = useState<number[][]>(() => [Array.from({ length: count }, (_, i) => i)])
  const contentRef = useRef<HTMLDivElement>(null)
  const sigRef = useRef('')

  useLayoutEffect(() => {
    const measure = () => {
      const content = contentRef.current
      const container = content?.parentElement
      if (!content || !container) return
      const width = container.clientWidth
      if (!width) return
      const usable = width * SHEET_ASPECT * CONTENT_FRACTION * FILL
      const top = (el: Element) => el.getBoundingClientRect().top
      const nodes = content.querySelectorAll<HTMLElement>('[data-ri]')
      if (nodes.length !== count) return
      const els = new Array<HTMLElement>(count)
      nodes.forEach((el) => {
        els[Number(el.getAttribute('data-ri'))] = el
      })
      const firstTable = content.querySelector('table.donor-dir')
      if (!firstTable) return
      // Sheet 1 reserves the title banner + subtitle + column header (everything
      // above the first row); continuation sheets reserve just the column header.
      const preH = top(els[0]) - top(content)
      const headH = top(els[0]) - top(firstTable)
      const rowH = (i: number) => {
        const el = els[i]
        const next = els[i + 1]
        return (next ? top(next) : el.getBoundingClientRect().bottom) - top(el)
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
      // Never strand a band / sub-table header at the very bottom of a sheet — it
      // introduces the rows beneath it, so it must travel to the next sheet.
      for (let p = 0; p < out.length - 1; p++) {
        while (out[p].length && HEADERISH.has(rows[out[p][out[p].length - 1]].kind)) {
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
    <>
      {pages.map((idxs, i) => (
        <ReferencePage
          key={i}
          pageIndex={i}
          title={i === 0 ? 'DONORS FROM RI DISTRICT 3055' : undefined}
          contentClassName="donors"
          noPaginate
        >
          {i === 0 && subtitle && <p className="donor-subtitle">{subtitle}</p>}
          {renderDonorSheet(idxs, rows)}
        </ReferencePage>
      ))}

      {/* Hidden probe — subtitle + the full table at the real sheet width, so the
          header and every row can be measured before the row-split. */}
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
          className="ref-content donors"
          ref={contentRef}
          style={{ position: 'static', width: '85%', height: 'auto', bottom: 'auto', '--ref-base': '1.8014cqw' } as React.CSSProperties}
        >
          <div className="ref-title">DONORS FROM RI DISTRICT 3055</div>
          {subtitle && <p className="donor-subtitle">{subtitle}</p>}
          {renderDonorSheet(
            Array.from({ length: count }, (_, i) => i),
            rows,
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Donor Recognition prose (pages 240-241) — unchanged: rendered exactly as before.
// ---------------------------------------------------------------------------
type RecogBodyItem = { type: 'para' | 'li'; content: string }
type RecogBlock =
  | { type: 'heading'; content: string }
  | { type: 'subheading'; content: string }
  | { type: 'para'; content: string }
  | { type: 'li'; content: string }
  // A recognition entry with an insignia photo — the image sits beside the whole
  // entry (its subheading + body text/bullets), kept as ONE atomic block so it never
  // splits across sheets and its measured height includes the image.
  | { type: 'entry'; img: string; heading: string; body: RecogBodyItem[] }

const RECOG_LIST_CLASS = 'ref-ul ref-ul--dot donor-bullets'

/** Background-removed recognition insignia shown beside a matching Individual-recognition
 *  subheading (public/recognition/*.png). PHF and Multiple PHF share the same insignia. */
const RECOG_IMAGES: Record<string, string> = {
  'Benefactor': '/recognition/benefactor.png',
  'Paul Harris Fellow': '/recognition/phf-new.png',
  'Multiple Paul Harris Fellow': '/recognition/mphf.png',
  'Major Donor': '/recognition/major-donor.png',
  'Arch Klumph Society': '/recognition/aks.jpg',
}

/** Flatten the recognition prose into atomic blocks — every bullet becomes its own
 *  `li` block so a list can break across sheets and pack tightly (no big gap).
 *  EXCEPTION: a subheading listed in RECOG_IMAGES is bundled with its following body
 *  (paragraphs + bullets, up to the next heading/subheading) into one `entry` block,
 *  so its insignia photo can sit beside the whole entry. */
function buildRecogBlocks(blocks: DonorBlock[]): RecogBlock[] {
  const out: RecogBlock[] = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.kind === 'subheading' && RECOG_IMAGES[b.text || '']) {
      const heading = b.text || ''
      const body: RecogBodyItem[] = []
      i++
      for (; i < blocks.length && blocks[i].kind !== 'heading' && blocks[i].kind !== 'subheading'; i++) {
        const bb = blocks[i]
        if (bb.kind === 'para') body.push({ type: 'para', content: bb.text || '' })
        else if (bb.kind === 'bullets') for (const it of bb.items || []) body.push({ type: 'li', content: it })
      }
      i-- // step back — the outer loop's i++ will land on the next unconsumed block
      out.push({ type: 'entry', img: RECOG_IMAGES[heading], heading, body })
      continue
    }
    switch (b.kind) {
      case 'heading':
        out.push({ type: 'heading', content: b.text || '' })
        break
      case 'subheading':
        out.push({ type: 'subheading', content: b.text || '' })
        break
      case 'para':
        out.push({ type: 'para', content: b.text || '' })
        break
      case 'bullets':
        for (const it of b.items || []) out.push({ type: 'li', content: it })
        break
    }
  }
  return out
}

/** Render an entry's body items (paras + bullets), grouping consecutive bullets into
 *  one list — used inside a photo entry's text column. */
function renderRecogBody(body: RecogBodyItem[]): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < body.length) {
    if (body[i].type === 'li') {
      const items: ReactNode[] = []
      while (i < body.length && body[i].type === 'li') items.push(<li key={i}>{body[i++].content}</li>)
      out.push(
        <ul className={RECOG_LIST_CLASS} key={`ul-${key++}`}>
          {items}
        </ul>,
      )
    } else {
      out.push(<p key={`p-${key++}`}>{body[i++].content}</p>)
    }
  }
  return out
}

/** Render a slice of recognition blocks, regrouping consecutive `li` blocks into a
 *  single bullet list. Each block carries data-bi for the probe's measurement. */
function renderRecogSheet(indices: number[], blocks: RecogBlock[]): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < indices.length) {
    const b = blocks[indices[i]]
    if (b.type === 'li') {
      const firstIdx = indices[i]
      const items: ReactNode[] = []
      while (i < indices.length && blocks[indices[i]].type === 'li') {
        const g = indices[i]
        const gb = blocks[g]
        if (gb.type === 'li')
          items.push(
            <li key={g} data-bi={g}>
              {gb.content}
            </li>,
          )
        i++
      }
      out.push(
        <ul className={RECOG_LIST_CLASS} key={`ul-${firstIdx}`}>
          {items}
        </ul>,
      )
    } else if (b.type === 'heading') {
      out.push(
        <h3 className="donor-h" data-bi={indices[i]} key={key++}>
          {b.content}
        </h3>,
      )
      i++
    } else if (b.type === 'subheading') {
      out.push(
        <p className="donor-sub" data-bi={indices[i]} key={key++}>
          {b.content}
        </p>,
      )
      i++
    } else if (b.type === 'entry') {
      const imgRight = b.heading === 'Arch Klumph Society' || b.heading === 'Major Donor'
      const imgLarge =
        b.heading === 'Benefactor' || b.heading === 'Major Donor' || b.heading === 'Arch Klumph Society'
      const isBenefactor = b.heading === 'Benefactor'
      const cls = `donor-entry${imgRight ? ' donor-entry--img-right' : ''}${imgLarge ? ' donor-entry--lg' : ''}${isBenefactor ? ' donor-entry--benefactor' : ''}`
      out.push(
        <div className={cls} data-bi={indices[i]} key={key++}>
          <img className="donor-recog-img" src={b.img} alt="" aria-hidden="true" />
          <div className="donor-entry-body">
            <p className="donor-sub donor-entry-h">{b.heading}</p>
            {renderRecogBody(b.body)}
          </div>
        </div>,
      )
      i++
    } else {
      out.push(
        <p data-bi={indices[i]} key={key++}>
          {b.content}
        </p>,
      )
      i++
    }
  }
  return out
}

const RECOG_HEADERISH = new Set(['heading', 'subheading'])

/** Donor Recognition prose — flows continuously across B5 sheets, split at block
 *  boundaries (paragraphs and individual bullets) so each sheet fills to the bottom
 *  margin instead of stranding a whole section on a fresh page. */
function DonorRecognition({ blocks, title }: { blocks: DonorBlock[]; title: string }) {
  const recog = buildRecogBlocks(blocks)
  const count = recog.length
  const [pages, setPages] = useState<number[][]>(() => [Array.from({ length: count }, (_, i) => i)])
  const contentRef = useRef<HTMLDivElement>(null)
  const sigRef = useRef('')

  useLayoutEffect(() => {
    const measure = () => {
      const content = contentRef.current
      const container = content?.parentElement
      if (!content || !container) return
      const width = container.clientWidth
      if (!width) return
      const usable = width * SHEET_ASPECT * CONTENT_FRACTION * FILL
      const top = (el: Element) => el.getBoundingClientRect().top
      const nodes = content.querySelectorAll<HTMLElement>('[data-bi]')
      if (nodes.length !== count) return
      const els = new Array<HTMLElement>(count)
      nodes.forEach((el) => {
        els[Number(el.getAttribute('data-bi'))] = el
      })
      // Sheet 1 reserves the title banner (everything above the first block);
      // continuation sheets carry no title, so their full height is free.
      const preH = top(els[0]) - top(content)
      const blockH = (i: number) => {
        const el = els[i]
        const next = els[i + 1]
        return (next ? top(next) : el.getBoundingClientRect().bottom) - top(el)
      }
      const out: number[][] = []
      let cur: number[] = []
      let used = preH
      for (let i = 0; i < count; i++) {
        const h = blockH(i)
        if (used + h > usable && cur.length) {
          out.push(cur)
          cur = []
          used = 0
        }
        cur.push(i)
        used += h
      }
      if (cur.length) out.push(cur)
      // Never strand a heading / subheading at the very bottom of a sheet — it
      // introduces the text beneath it, so it must travel to the next sheet.
      for (let p = 0; p < out.length - 1; p++) {
        while (out[p].length && RECOG_HEADERISH.has(recog[out[p][out[p].length - 1]].type)) {
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
    <>
      {pages.map((idxs, i) => (
        <ReferencePage key={i} pageIndex={i} title={i === 0 ? title : undefined} contentClassName="donors recog" noPaginate>
          {renderRecogSheet(idxs, recog)}
        </ReferencePage>
      ))}

      {/* Hidden probe — the full prose at the real sheet width, so the title and
          every block can be measured before the block-split. */}
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
          className="ref-content donors recog"
          ref={contentRef}
          style={{ position: 'static', width: '85%', height: 'auto', bottom: 'auto', '--ref-base': '1.8014cqw' } as React.CSSProperties}
        >
          <div className="ref-title">{title}</div>
          {renderRecogSheet(
            Array.from({ length: count }, (_, i) => i),
            recog,
          )}
        </div>
      </div>
    </>
  )
}

/** Donors from RI District 3055 + Donor Recognition (source: pages 236-241). Both
 *  the donor table (pages 236-239) and the recognition prose (pages 240-241) are
 *  packed to fill every sheet — the table Zone-4 style, the prose block-by-block. */
export function DonorsPage() {
  const recogStart = DONOR_SHEETS.findIndex((s) => s.banner === 'DONOR RECOGNITION')
  const tableSheets = recogStart >= 0 ? DONOR_SHEETS.slice(0, recogStart) : DONOR_SHEETS
  const textSheets = recogStart >= 0 ? DONOR_SHEETS.slice(recogStart) : []
  const tableBlocks = tableSheets.flatMap((s) => s.blocks)
  const textBlocks = textSheets.flatMap((s) => s.blocks)
  const recogTitle = textSheets[0]?.banner || 'DONOR RECOGNITION'

  return (
    <ReferenceDoc title="Donors from RI District 3055">
      <DonorDirectory blocks={tableBlocks} subtitle={null} />
      {textBlocks.length > 0 && <DonorRecognition blocks={textBlocks} title={recogTitle} />}
    </ReferenceDoc>
  )
}
