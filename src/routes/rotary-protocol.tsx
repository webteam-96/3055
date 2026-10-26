import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'

export const Route = createFileRoute('/rotary-protocol')({
  component: RotaryProtocolPage,
})

// B5 sheet geometry (mirrors ReferencePage / the RI South Asia Office page) so the
// content can be split by BLOCK — paragraph, heading and individual list item — and
// packed continuously, filling every sheet to the bottom margin instead of bumping a
// whole indivisible list to the next sheet and leaving the tail of a page blank. A
// hair under ReferencePage's own fill factor so the slices we hand it (noPaginate)
// never trigger a second split.
const SHEET_ASPECT = 697.32 / 527.24
const CONTENT_FRACTION = 1 - 0.12 - 0.08
const FILL = 0.98

type Block =
  | { type: 'p'; content: ReactNode }
  | { type: 'heading'; content: string }
  | { type: 'li'; listClass: string; content: ReactNode }

// The page's content as a flat list of atomic blocks (source: Directory-2025-26.pdf,
// page 232). Consecutive `li` blocks sharing a listClass are regrouped into one <ul>
// at render time, so a list can break across a sheet boundary and continue on the
// next sheet — the mechanism that lets the sheets fill continuously.
const BLOCKS: Block[] = [
  {
    type: 'p',
    content: (
      <>
        <span className="ref-note" style={{ color: 'var(--ref-blue)' }}>
          26.050. Rotary Protocol
        </span>{' '}
        (Rotary Code of Policies 114, January 2022)
      </>
    ),
  },
  {
    type: 'p',
    content:
      'The following order of protocol is recommended for introducing, presenting, and seating all current, past, and future officers of RI and its Foundation, committee members, and their partners at all Rotary meetings, functions, and for listing in all Ri publications:',
  },
  { type: 'heading', content: 'District :' },
  { type: 'li', listClass: 'ref-ul', content: 'District Governors' },
  { type: 'li', listClass: 'ref-ul', content: 'Past District Governors (in order of seniority)' },
  {
    type: 'li',
    listClass: 'ref-ul',
    content:
      'Rotary coordinators, Rotary public image coordinators, Regional Rotary Foundation coordinators and endowment/major gifts advisers',
  },
  { type: 'li', listClass: 'ref-ul', content: 'District Governors-elect/District Governors-nominee (in order)' },
  {
    type: 'p',
    content:
      'After the recommended order of protocol above, the following additional order of protocol recommended and should be modified to fit local customs and practice:',
  },
  { type: 'li', listClass: 'ref-ul', content: 'Regional and Zone-Level committee members' },
  { type: 'li', listClass: 'ref-ul', content: 'Assistant Governors' },
  { type: 'li', listClass: 'ref-ul', content: 'District secretaries/treasurers' },
  { type: 'li', listClass: 'ref-ul', content: 'District committee members' },
  { type: 'li', listClass: 'ref-ul', content: 'Club presidents/presidents-elect/vice-presidents' },
  { type: 'li', listClass: 'ref-ul', content: 'Club secretaries' },
  { type: 'li', listClass: 'ref-ul', content: 'Club treasurers' },
  { type: 'li', listClass: 'ref-ul', content: 'Club sergeants-at-arms' },
  { type: 'li', listClass: 'ref-ul', content: 'Other club board members' },
  { type: 'li', listClass: 'ref-ul', content: 'Club committee chairs' },
  { type: 'li', listClass: 'ref-ul', content: 'Past Assistant Governors' },
  { type: 'li', listClass: 'ref-ul', content: 'Rotarians' },
  { type: 'li', listClass: 'ref-ul', content: 'Rotary alumni' },
  { type: 'li', listClass: 'ref-ul', content: "Rotarians' families" },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      'Any Rotary meeting hosted by a club, and/or a regular meeting of the club should be presided over by the President of the club. The meeting should be called to order by the President and not by the Master of Ceremonies.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      'Any Rotary meeting hosted by the district-on-district Committee will be presided over by the District Governor. Governor will call the meeting to order.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      'The General Rule is that current position takes precedence over past position, past position takes precedence over future position, accompanying spouses will have the same ranking.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content: 'Once protocol is observed in a meeting initially, the subsequent speakers NEED NOT repeat the protocol.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      'If the Mayor or the First Citizen of the town is present in a meeting, he should be invited to the dais and should be recognized first.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      'In any Rotary meeting if the Governor is present as the Chief Guest, he should speak last. only item after his speech should be acknowledgment/vpte of thanks.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      'During the official visit of the Governor to the Club, there should be no other Chief Guest, Governor being the only one.',
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content:
      "The functions of Master of ceremony, if at all necessary, should be limited only announce the item' of the agenda to be followed. He/she is not expected to make comments on the speeches or assure anything on behalf of the club, which should only be the prerogative of the Presiding Officer.",
  },
  {
    type: 'li',
    listClass: 'ref-ul ref-ul--diamond',
    content: 'Rotarians visiting from a foreign country may be placed before local Rotarians of the same rank, as a courtesy.',
  },
]

/** Render a slice of block indices, regrouping consecutive same-class `li` blocks
 *  into one <ul> so the diamond/plain markers stay correct even when a list is split
 *  across sheets. Each block element carries data-bi for the probe's measurement. */
function renderBlocks(indices: number[]): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0
  while (i < indices.length) {
    const b = BLOCKS[indices[i]]
    if (b.type === 'li') {
      const listClass = b.listClass
      const firstIdx = indices[i]
      const items: ReactNode[] = []
      while (i < indices.length) {
        const j = indices[i]
        const bj = BLOCKS[j]
        if (bj.type !== 'li' || bj.listClass !== listClass) break
        items.push(
          <li key={j} data-bi={j}>
            {bj.content}
          </li>,
        )
        i++
      }
      out.push(
        <ul key={`ul-${firstIdx}`} className={listClass}>
          {items}
        </ul>,
      )
    } else if (b.type === 'p') {
      out.push(
        <p key={indices[i]} data-bi={indices[i]}>
          {b.content}
        </p>,
      )
      i++
    } else {
      out.push(
        <h2 key={indices[i]} data-bi={indices[i]} className="ref-h">
          <span>{b.content}</span>
        </h2>,
      )
      i++
    }
  }
  return out
}

/** Rotary Protocol & Decorum (source: Directory-2025-26.pdf, page 232). The content
 *  flows continuously across B5 sheets, split at block boundaries (paragraphs and
 *  individual list items) so each sheet fills to the bottom margin at the uniform
 *  body size — no page is left half-empty by an indivisible list. */
export function RotaryProtocolPage() {
  const count = BLOCKS.length
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
      // Map each block index to its rendered element in the probe.
      const nodes = content.querySelectorAll<HTMLElement>('[data-bi]')
      if (nodes.length !== count) return // probe not fully rendered yet
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
      // Never strand a heading at the very bottom of a sheet — it introduces the
      // list beneath it, so it must travel to the next sheet with its items.
      for (let p = 0; p < out.length - 1; p++) {
        while (out[p].length && BLOCKS[out[p][out[p].length - 1]].type === 'heading') {
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
    <ReferenceDoc title="Rotary Protocol & Decorum">
      {pages.map((idxs, i) => (
        <ReferencePage
          key={i}
          pageIndex={i}
          title={i === 0 ? 'ROTARY PROTOCOL & DECORUM' : undefined}
          contentClassName="protocol"
          noPaginate
        >
          {renderBlocks(idxs)}
        </ReferencePage>
      ))}

      {/* Hidden probe — the full content at the real sheet width, so the title and
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
          className="ref-content protocol"
          ref={contentRef}
          style={
            { position: 'static', width: '85%', height: 'auto', bottom: 'auto', '--ref-base': '1.8014cqw' } as React.CSSProperties
          }
        >
          <div className="ref-title">ROTARY PROTOCOL &amp; DECORUM</div>
          {renderBlocks(Array.from({ length: count }, (_, i) => i))}
        </div>
      </div>
    </ReferenceDoc>
  )
}
