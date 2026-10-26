import { Fragment, useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage, ReferenceTitlePage } from '../components/ReferencePage'
import { INFO_SHEETS, type InfoBlock, type InfoSheet } from '../data/rotaryInfo'

export const Route = createFileRoute('/rotary-information')({
  component: RotaryInformationPage,
})

// Per-page body density so each source page fits a single B5 sheet while keeping
// the Profile/Message type hierarchy. Tuned against the rendered heights.
const DENSITY: Record<number, number> = {
  250: 0.97, // timeline pages: body bumped ~2px (0.82/0.78/0.70 -> larger, readable type)
  251: 0.93,
  252: 0.85,
  253: 0.86,
  254: 0.9,
  255: 0.79,
  256: 0.9,
  257: 0.68,
  258: 0.58,
  259: 0.76,
  260: 0.74,
  261: 0.74,
  262: 0.86,
  263: 0.86,
}
// Rotary Designated Months pages -> one media row per month (photo left, text right).
const MONTH_PAGES = new Set([260, 261])
// Pages with a long acronym list -> two columns (the Rotary Acronyms sheet, whose
// two balanced blocks each fill one B5 sheet -> the section packs into 2 sheets).
const TWOCOL_BULLETS = new Set([258])
// The Rotary Foundation Milestones section (banner on 253, continues on 254-255).
const MILESTONE_PAGES = new Set([253, 254, 255])
// Rotary in India + Women in Rotary — people/portrait pages.
const PEOPLE_PAGES = new Set([256, 257])
// Rotary's Timeline pages -> vertical-spine timeline layout (year rail + entries).
const TIMELINE_PAGES = new Set([250, 251, 252])

// Merge the three Rotary's Timeline source pages (250-252) into ONE sheet so the
// milestone entries flow continuously across B5 sheets and fill them — instead of
// each source page starting a fresh sheet and stranding entries (e.g. RYLA) on a
// mostly-empty page. The banner rides on the first (page 250).
function mergeTimelineSheets(sheets: InfoSheet[]): InfoSheet[] {
  const out: InfoSheet[] = []
  let merged: InfoSheet | null = null
  for (const s of sheets) {
    if (TIMELINE_PAGES.has(s.page)) {
      if (!merged) {
        merged = { ...s, blocks: [...s.blocks] }
        out.push(merged)
      } else {
        merged.blocks.push(...s.blocks)
      }
    } else {
      out.push(s)
    }
  }
  return out
}
// Merge the three Rotary Foundation Milestones pages (253-255) into one continuous
// stream (each source page's photo rides at the front via imagesFirst so it floats
// beside its entries), then re-split it into exactly TWO sheets at the 1988 entry:
// sheet 1 = banner + Arch photo + 1917-1985, sheet 2 = 1988-2017. This packs the
// section into 2 full B5 sheets instead of the auto-paginator's wasteful 3 (its
// height measure over-estimates around the floated photo, breaking early).
function mergeMilestoneSheets(sheets: InfoSheet[]): InfoSheet[] {
  const out: InfoSheet[] = []
  let merged: InfoSheet | null = null
  for (const s of sheets) {
    if (MILESTONE_PAGES.has(s.page)) {
      const blocks = imagesFirst(s.blocks)
      if (!merged) {
        merged = { ...s, blocks: [...blocks] }
        out.push(merged)
      } else {
        merged.blocks.push(...blocks)
      }
    } else {
      out.push(s)
    }
  }
  if (merged) {
    const idx = merged.blocks.findIndex((b) => b.kind === 'yearHead' && (b.text || '').trim() === '1988')
    if (idx > 0) {
      const rest = merged.blocks.splice(idx) // 1988 → 2017
      const at = out.indexOf(merged)
      out.splice(at + 1, 0, { ...merged, page: 254, banner: null, blocks: rest })
    }
  }
  return out
}
// Merge the two Rotary Designated Months pages (260-261) into ONE continuous stream
// so all twelve months flow across exactly two well-filled B5 sheets — the banner
// rides on the first, and the untitled second sheet absorbs any overflow, keeping the
// section at 2 pages even with the enlarged photos and +2px text.
function mergeMonthsSheets(sheets: InfoSheet[]): InfoSheet[] {
  const out: InfoSheet[] = []
  let merged: InfoSheet | null = null
  for (const s of sheets) {
    if (MONTH_PAGES.has(s.page)) {
      if (!merged) {
        merged = { ...s, blocks: [...s.blocks] }
        out.push(merged)
      } else {
        merged.blocks.push(...s.blocks)
      }
    } else {
      out.push(s)
    }
  }
  return out
}
const INFO_SHEETS_MERGED = mergeMonthsSheets(mergeMilestoneSheets(mergeTimelineSheets(INFO_SHEETS)))

// A cropped source image; falls back to a labelled placeholder until the asset
// is present, so every page is complete and self-documenting meanwhile.
function InfoImg({ src, alt, describe }: { src?: string; alt?: string; describe?: string | null }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className="info-ph" role="img" aria-label={describe || alt || 'image'}>
        <span>{describe || 'image'}</span>
      </div>
    )
  }
  return <img src={src} alt={alt || describe || ''} onError={() => setFailed(true)} />
}

const posClass = (position?: string | null) => {
  const p = (position || '').toLowerCase()
  if (p.includes('full')) return 'full'
  if (p.includes('right')) return 'right'
  return 'left'
}
const isRoleLine = (t: string) => /president|governor|trustee|director|calcutta|chandigarh|vapi|kolkatta|kolkata/i.test(t)

type PBlock = InfoBlock & { name?: string; role?: string | null }

// Collapse an image + duplicated-name para (+ role para) into a single portrait
// block, so the RI-President / Women-in-Rotary galleries render as a clean grid.
function preprocess(blocks: InfoBlock[]): PBlock[] {
  const out: PBlock[] = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.kind === 'image' && b.caption) {
      const next = blocks[i + 1]
      if (next && next.kind === 'para' && (next.text || '').trim() === b.caption.trim()) {
        let role: string | null = null
        let j = i + 2
        if (blocks[j] && blocks[j].kind === 'para' && isRoleLine(blocks[j].text || '')) {
          role = blocks[j].text || null
          j++
        }
        out.push({ ...b, kind: 'portrait', name: b.caption, role })
        i = j - 1
        continue
      }
    }
    out.push(b)
  }
  return out
}

// Milestones layout: float the photo(s) to the top so the year entries flow beside
// them (text + photo side by side). Moving images to the front makes the float sit
// alongside the following text rather than below it.
function imagesFirst(blocks: InfoBlock[]): InfoBlock[] {
  const imgs = blocks.filter((b) => b.kind === 'image')
  const rest = blocks.filter((b) => b.kind !== 'image')
  return [...imgs, ...rest]
}

// People pages (Rotary in India / Women in Rotary): render every captioned photo as
// a centered portrait — photo + name (+ designation) — even when the source has no
// separate duplicated-name paragraph. Absorbs an optional duplicated-name para and a
// following role line so the grid shows a clean, centered photo/name/designation.
function peoplePortraits(blocks: InfoBlock[]): PBlock[] {
  const out: PBlock[] = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.kind === 'image' && b.caption) {
      let role: string | null = null
      let j = i + 1
      if (blocks[j] && blocks[j].kind === 'para' && (blocks[j].text || '').trim() === b.caption.trim()) j++
      if (blocks[j] && blocks[j].kind === 'para' && isRoleLine(blocks[j].text || '')) {
        role = blocks[j].text || null
        j++
      }
      out.push({ ...b, kind: 'portrait', name: b.caption, role })
      i = j - 1
      continue
    }
    out.push(b as PBlock)
  }
  return out
}

function renderBlocks(raw: InfoBlock[]): ReactNode[] {
  const blocks = preprocess(raw)
  const out: ReactNode[] = []
  let portraits: PBlock[] = []
  let key = 0
  const flushPortraits = () => {
    if (!portraits.length) return
    const items = portraits
    portraits = []
    out.push(
      <div className="info-portraits" key={`pg${key++}`}>
        {items.map((p) => (
          <div className="info-portrait" key={p.id}>
            <InfoImg src={p.img} alt={p.name} describe={p.describe} />
            {p.name && <div className="nm">{p.name}</div>}
            {p.role && <div className="rl">{p.role}</div>}
          </div>
        ))}
      </div>,
    )
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.kind === 'portrait') {
      portraits.push(b)
      continue
    }
    flushPortraits()
    switch (b.kind) {
      case 'blueHead':
        out.push(
          <h3 className="info-blue" key={`h${key++}`}>
            {b.text}
          </h3>,
        )
        break
      case 'yearHead': {
        // Gather this year's following paragraphs into the entry body.
        const paras: string[] = []
        let j = i + 1
        while (j < blocks.length && blocks[j].kind === 'para') {
          paras.push(blocks[j].text || '')
          j++
        }
        out.push(
          <div className="info-year-row" key={`y${key++}`}>
            <div className="yr">{b.text}</div>
            <div className="bd">
              {paras.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
          </div>,
        )
        i = j - 1
        break
      }
      case 'para':
        out.push(<p key={`p${key++}`}>{b.text}</p>)
        break
      case 'bold':
        out.push(
          <p className="ref-note" key={`b${key++}`}>
            {b.text}
          </p>,
        )
        break
      case 'bullets':
        out.push(
          <ul className="ref-ul ref-ul--dot info-bullets" key={`u${key++}`}>
            {(b.items || []).map((it, k) => {
              // Bold the leading abbreviation (e.g. "AG", "AGM"); keep the rest as-is.
              const m = it.match(/^(\S+)([\s\S]*)$/)
              return (
                <li key={k}>
                  {m ? <strong>{m[1]}</strong> : it}
                  {m ? m[2] : ''}
                </li>
              )
            })}
          </ul>,
        )
        break
      case 'image':
        out.push(
          <figure className={`info-figure ${posClass(b.position)}`} key={`i${key++}`}>
            <InfoImg src={b.img} alt={b.caption || ''} describe={b.describe} />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>,
        )
        break
      case 'oathBlock':
        out.push(
          <figure className="info-figure full oath-figure" key={`o${key++}`}>
            <InfoImg src={b.img} alt={b.text || 'oath'} describe={b.describe} />
          </figure>,
        )
        break
    }
  }
  flushPortraits()
  out.push(<div className="info-clear" key={`c${key++}`} />)
  return out
}

// Rotary Designated Months (pages 260-261): the source blocks interleave each
// month's heading, subtext and promotional graphic in mixed order. Regroup them
// into one entry per month — keyed off the month word in the heading ("July : …")
// and in the image caption ("JULY IS / …") so the pairing is robust to that order —
// and render each as a media row: the graphic on the LEFT, the heading (dark blue)
// and subtext (black) on the RIGHT. Every month from the source is kept.
const MONTH_KEYS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]
const monthKey = (s?: string | null): string | null => {
  const up = (s || '').trim().toUpperCase()
  return MONTH_KEYS.find((m) => up.startsWith(m)) || null
}
function renderMonths(blocks: InfoBlock[]): ReactNode[] {
  type M = { img?: InfoBlock; heading?: string; sub?: string }
  const map = new Map<string, M>()
  const order: string[] = []
  const ensure = (k: string): M => {
    let m = map.get(k)
    if (!m) {
      m = {}
      map.set(k, m)
      order.push(k)
    }
    return m
  }
  let cur: string | null = null
  for (const b of blocks) {
    if (b.kind === 'blueHead') {
      const k = monthKey(b.text)
      if (k) {
        ensure(k).heading = b.text || ''
        cur = k
      }
    } else if (b.kind === 'para') {
      if (cur) ensure(cur).sub = b.text || ''
    } else if (b.kind === 'image') {
      const k = monthKey(b.caption) || cur
      if (k) ensure(k).img = b
    }
  }
  return order.map((k, i) => {
    const m = map.get(k) as M
    return (
      // Alternate the photo left/right down the list (odd months flip to the right).
      <div className={`month-row${i % 2 === 1 ? ' month-row--flip' : ''}`} key={`m${i}`}>
        <figure className="month-photo">
          <InfoImg src={m.img?.img} alt={m.heading || ''} describe={m.img?.describe} />
        </figure>
        <div className="month-body">
          {m.heading && <h3>{m.heading}</h3>}
          {m.sub && <p>{m.sub}</p>}
        </div>
      </div>
    )
  })
}

// Rotary's Timeline: regroup the flat blueHead/image/para stream into milestone
// entries and lay them out as a vertical timeline — a year rail on the left, a
// gold spine with a navy node per entry, then the blue title, its photos as
// compact thumbnails, and the description. Same text + images as the source; only
// the placement/style changes. Each blueHead is "Title I Year"; split the year off.
function renderTimeline(blocks: InfoBlock[]): ReactNode[] {
  type TLEntry = { title: string; year: string; images: InfoBlock[]; paras: string[] }
  const entries: TLEntry[] = []
  let cur: TLEntry | null = null
  for (const b of blocks) {
    if (b.kind === 'blueHead') {
      if (cur) entries.push(cur)
      const m = (b.text || '').match(/^(.*?)\s+I\s+(\d.*)$/)
      cur = { title: (m ? m[1] : b.text || '').trim(), year: m ? m[2].trim() : '', images: [], paras: [] }
    } else if (cur) {
      if (b.kind === 'image') cur.images.push(b)
      else if (b.kind === 'para' && (b.text || '').trim()) cur.paras.push(b.text as string)
    }
  }
  if (cur) entries.push(cur)

  // Return each milestone as a separate top-level node (no wrapping container) so
  // ReferencePage can flow them across as many B5 sheets as they need.
  return entries.map((e, i) => {
        // RYLA keeps its inline full-width photo; most entries float their photo right.
        const keepAsIs = /Rotary Youth Leadership Awards/.test(e.title)
        // "Rotary arrives in Asia": drop its photo BELOW the text and enlarge it to
        // fill the empty tail of the sheet (instead of a small right-hand float).
        const asiaFeature = /arrives in Asia/.test(e.title)
        // "The first foundation program": likewise centre its photo below the text and
        // enlarge it so the space under the entry is used, not a small right float.
        const foundationFeature = /first foundation program/.test(e.title)
        // "Gates Foundation commits for Polio": centre its photo below the text and
        // enlarge it (big centred portrait) instead of a small right-hand float.
        const gatesFeature = /Gates Foundation/.test(e.title)
        const floatRight =
          e.images.length > 0 && !keepAsIs && !asiaFeature && !foundationFeature && !gatesFeature
        // Per-milestone photo sizing: extra-small / small portraits, larger wide/paired shots.
        const sideSize = /Rotarian magazine|Four Way Test/.test(e.title)
          ? ' tl-side--xs'
          : /first foundation program|Founding Years/.test(e.title)
            ? ' tl-side--lg'
            : ''
        // RYLA + "arrives in Asia" render full-width (bigger); the rest stay thumbnails.
        const figures = e.images.map((im) => (
          <figure
            className={`tl-img${
              !floatRight && (keepAsIs || asiaFeature || foundationFeature || gatesFeature || posClass(im.position) === 'full') ? ' wide' : ''
            }${asiaFeature ? ' tl-img--asia' : ''}${foundationFeature ? ' tl-img--foundation' : ''}${gatesFeature ? ' tl-img--gates' : ''}`}
            key={im.id}
          >
            <InfoImg src={im.img} alt={im.caption || ''} describe={im.describe} />
            {im.caption && <figcaption>{im.caption}</figcaption>}
          </figure>
        ))
        return (
          <div className="tl-entry" key={i}>
            <div className="tl-year">{e.year}</div>
            <div className="tl-main">
              {e.title && <h3 className="tl-title">{e.title}</h3>}
              {!asiaFeature && !foundationFeature && !gatesFeature &&
                e.images.length > 0 &&
                (floatRight ? <div className={`tl-side${sideSize}`}>{figures}</div> : <div className="tl-imgs">{figures}</div>)}
              {e.paras.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
              {(asiaFeature || foundationFeature || gatesFeature) && e.images.length > 0 && <div className="tl-imgs">{figures}</div>}
            </div>
          </div>
        )
  })
}

/** Rotary Information — timeline, milestones, India, women, acronyms, oath
 *  (source: Directory-2025-26.pdf, pages 250-263). */
export function RotaryInformationPage() {
  return (
    <ReferenceDoc title="Rotary Information">
      {/* Section cover / title page, then the content sheets (offset by 1 so the
          recto/verso frames keep alternating from the cover). */}
      <ReferenceTitlePage title="ROTARY INFORMATION" pageIndex={0} />
      {INFO_SHEETS_MERGED.map((sheet, i) => {
        const cls = `info${TWOCOL_BULLETS.has(sheet.page) ? ' twocol' : ''}${
          MONTH_PAGES.has(sheet.page) ? ' months' : ''
        }${TIMELINE_PAGES.has(sheet.page) ? ' timeline' : ''}${MILESTONE_PAGES.has(sheet.page) ? ' milestones' : ''}${
          PEOPLE_PAGES.has(sheet.page) ? ' people' : ''
        }${sheet.page === 256 ? ' india' : ''}${sheet.page === 257 ? ' women' : ''}${
          sheet.page === 262 || sheet.page === 263 ? ' oath' : ''
        }`
        const body = MONTH_PAGES.has(sheet.page)
          ? renderMonths(sheet.blocks)
          : TIMELINE_PAGES.has(sheet.page)
            ? renderTimeline(sheet.blocks)
            : renderBlocks(PEOPLE_PAGES.has(sheet.page) ? peoplePortraits(sheet.blocks) : sheet.blocks)
        return (
          <ReferencePage
            key={sheet.page}
            pageIndex={i + 1}
            title={sheet.banner || undefined}
            density={DENSITY[sheet.page] ?? 0.84}
            // Milestones: the content is pre-split into 2 sheets (see
            // mergeMilestoneSheets); a slightly generous fill keeps each half on its
            // own single sheet despite the floated photo skewing the height measure.
            fill={MILESTONE_PAGES.has(sheet.page) ? 1.12 : MONTH_PAGES.has(sheet.page) ? 1.05 : undefined}
            contentClassName={cls}
            // Women in Rotary: keep the whole section on ONE sheet so the three
            // portraits sit in the empty space under the timeline text (the
            // auto-paginator's 0.97 fill margin would otherwise bump them to a
            // near-empty second sheet). The row is sized to clear the sheet.
            noPaginate={sheet.page === 257}
          >
            {body.map((el, j) => (
              <Fragment key={j}>{el}</Fragment>
            ))}
          </ReferencePage>
        )
      })}
    </ReferenceDoc>
  )
}
