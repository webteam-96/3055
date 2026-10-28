import { DirectorySheet } from './DirectorySheet'
import type { CollectedPerson } from '../utils/pdf/collectPeople'
import { packSheets, twoColumns } from './appendixLayout'
import './AppendixPages.css'

// Max rows per COLUMN (two columns per sheet); the first sheet holds fewer for the title.
// Tuned so the last row clears the bottom border swoosh + page-number disc (the content
// box is ~10.8%→92.5% of the sheet; packing any more rows overflows into the frame).
const FIRST_COL = 34
const CONT_COL = 38

/** Pack the entries into full sheets (last sheet gets the remainder), then split each sheet
 *  into two near-equal columns — so every page is filled with no wasted space. */
function toSheets(entries: CollectedPerson[]): [CollectedPerson[], CollectedPerson[]][] {
  return packSheets(entries, 2 * FIRST_COL, 2 * CONT_COL).map((c) => twoColumns(c))
}

/**
 * The master export's "Bibliography" — every person in the book, A → Z (by name as shown),
 * each with the printed page number(s) they appear on. Two explicit columns per framed B5
 * sheet, the page numbers right-justified to the column edge, pages filled evenly. `entries`
 * must be pre-sorted.
 */
export function BibliographyPages({ entries }: { entries: CollectedPerson[] }) {
  const sheets = toSheets(entries)
  return (
    <>
      {sheets.map((cols, p) => (
        <DirectorySheet key={p} side={p % 2 === 0 ? 'right' : 'left'}>
          <div className="apx">
            {p === 0 && (
              <>
                <h1 className="apx-title">Bibliography</h1>
                <div className="apx-sub">Index of names &middot; page numbers</div>
              </>
            )}
            <div className="apx-cols">
              {cols.map((col, ci) => (
                <div className="apx-col" key={ci}>
                  {col.map((e, i) => (
                    <div className="apx-row" key={i}>
                      <span className="apx-name">{e.name}</span>
                      <span className="apx-pages">{e.pages.length ? e.pages.join(', ') : '—'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
