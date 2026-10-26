import { Fragment } from 'react'
import { DirectorySheet } from './DirectorySheet'
import { CommitteeMemberRow } from './CommitteeMemberRow'
import type { DistrictCommitteeMember } from '../types/api'
import type { ViewMode } from '../hooks/useViewMode'
import './CommitteeDirectory.css'

export interface CommitteeSection {
  title: string
  members: DistrictCommitteeMember[]
}

type Item =
  | { type: 'header'; title: string }
  | { type: 'member'; m: DistrictCommitteeMember }

// Greedily fill B5 sheets by ESTIMATED HEIGHT (cqw), not a fixed row count, so a
// card never crosses the page boundary. The numbers below are MEASURED from the
// rendered print sheet (browser, 720px sheet → 1cqw = 7.2px) against the committee
// content band, which "District Committee.svg" places at 9%–92.8% of the page =
// ~110.8cqw usable (see `.dir-content:has(.cm-sheet)` in DirectorySheet.css). Each
// height is a PITCH — the item plus one row gap — so the budget carries one extra
// gap to offset the last item having none.
//
// This reproduces the SVG exactly: FIVE member cards per page even when the page
// also carries TWO section titles (e.g. the SVG's own page: 4 cards under one title
// + 1 card under a second). 5·CARD_H + 2·SECTION_H = 110.9 ≤ 111.8, while a sixth
// card (6·CARD_H = 121.2) never fits — so pages always hold five cards, not four.
const SHEET_BUDGET = 111.8
const SECTION_H = 4.95 // section pill + row gap
const CARD_H = 20.2 // member card + row gap (5 per page; incl. 2-line classification)

function paginate(sections: CommitteeSection[]): Item[][] {
  const sheets: Item[][] = []
  let cur: Item[] = []
  let used = 0
  const flush = () => {
    if (cur.length) {
      sheets.push(cur)
      cur = []
      used = 0
    }
  }
  for (const s of sections) {
    if (!s.members.length) continue
    // Don't orphan a header at the bottom — need room for the header + 1 card.
    if (cur.length && used + SECTION_H + CARD_H > SHEET_BUDGET) flush()
    cur.push({ type: 'header', title: s.title })
    used += SECTION_H
    for (const m of s.members) {
      if (used + CARD_H > SHEET_BUDGET) flush()
      cur.push({ type: 'member', m })
      used += CARD_H
    }
  }
  flush()
  return sheets
}

/** Renders committee sections — continuous in web mode, paginated B5 sheets in
 *  print mode (P3 design). */
export function CommitteeDirectory({ sections, mode }: { sections: CommitteeSection[]; mode: ViewMode }) {
  if (mode === 'web') {
    return (
      <div className="cm-sheet">
        {sections.map((s, si) => (
          <Fragment key={si}>
            <div className="cm-section">{s.title}</div>
            {s.members.map((m, mi) => (
              <CommitteeMemberRow key={mi} m={m} />
            ))}
          </Fragment>
        ))}
      </div>
    )
  }
  const sheets = paginate(sections)
  if (!sheets.length) return null
  return (
    <>
      {sheets.map((items, i) => {
        const cardCount = items.reduce((n, it) => (it.type === 'member' ? n + 1 : n), 0)
        const titleCount = items.length - cardCount
        // A "full" page = five cards with at most one title. Only these spread their
        // cards to fill the sheet (via the springs); the denser two-title page and any
        // partial page keep the present top-aligned spacing. Springs go only where the
        // previous item is a card, so a section title stays snug above its first card.
        const fill = cardCount === 5 && titleCount <= 1
        return (
          <DirectorySheet key={i} pageNumber={i + 1} side={i % 2 === 0 ? 'right' : 'left'}>
            <div className="cm-sheet">
              {items.map((it, j) => (
                <Fragment key={j}>
                  {fill && j > 0 && items[j - 1].type === 'member' ? (
                    <div className="cm-spring" aria-hidden="true" />
                  ) : null}
                  {it.type === 'header' ? (
                    <div className="cm-section">{it.title}</div>
                  ) : (
                    <CommitteeMemberRow m={it.m} />
                  )}
                </Fragment>
              ))}
            </div>
          </DirectorySheet>
        )
      })}
    </>
  )
}
