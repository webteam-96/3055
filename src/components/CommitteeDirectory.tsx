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
// card never crosses the page boundary. Heights are measured from the rendered
// print sheet (card ≈ 22.1cqw + 1.6 gap; section pill ≈ 4.7 + 1.6 gap) against
// the ~106cqw usable content area; the budget keeps a small safety margin. This
// reliably fits 4 member cards per page (with or without a section header).
const SHEET_BUDGET = 104
const SECTION_H = 6.3 // section pill + row gap
const CARD_H = 23.7 // member card + row gap

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
      {sheets.map((items, i) => (
        <DirectorySheet key={i} pageNumber={i + 1} side={i % 2 === 0 ? 'right' : 'left'}>
          <div className="cm-sheet">
            {items.map((it, j) =>
              it.type === 'header' ? (
                <div className="cm-section" key={j}>
                  {it.title}
                </div>
              ) : (
                <CommitteeMemberRow key={j} m={it.m} />
              ),
            )}
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
