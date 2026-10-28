import { DirectorySheet } from './DirectorySheet'
import { MONTH_NAMES, monthOf, dayOf, type CollectedPerson } from '../utils/pdf/collectPeople'
import { packSheets, twoColumns } from './appendixLayout'
import './AppendixPages.css'

// Max rows per COLUMN (two columns per sheet); the first sheet holds fewer for the title.
// Tuned so pages pack full in the exported B5 sheet.
const FIRST_COL = 34
const CONT_COL = 38

type Row = { kind: 'month'; label: string } | { kind: 'person'; name: string; date: string }

/** Birthday shown as DD/MM only (the year is dropped — and placeholder years were unreliable). */
function ddmm(dob?: string): string {
  const m = monthOf(dob)
  const d = dayOf(dob)
  if (m && d) return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
  return (dob ?? '').trim() || '—'
}

/** Flatten the 12 month-groups into one row stream (month heading, then its people). The
 *  heading appears ONCE per month — when its list runs into the next column it simply
 *  continues (no repeated "(cont.)" heading) until the next month's heading appears. */
function buildRows(months: CollectedPerson[][]): Row[] {
  const rows: Row[] = []
  months.forEach((people, mi) => {
    if (!people.length) return
    rows.push({ kind: 'month', label: MONTH_NAMES[mi] })
    for (const p of people) rows.push({ kind: 'person', name: p.name, date: ddmm(p.dob) })
  })
  return rows
}

/** Pack the rows into full sheets, then split each sheet into two columns. If a column would
 *  end on a lone month heading (no names under it), push that heading to the next column. */
function toSheets(rows: Row[]): [Row[], Row[]][] {
  return packSheets(rows, 2 * FIRST_COL, 2 * CONT_COL).map((chunk) => {
    let [a, b] = twoColumns(chunk)
    if (a.length && a[a.length - 1].kind === 'month') {
      b = [a[a.length - 1], ...b]
      a = a.slice(0, -1)
    }
    return [a, b] as [Row[], Row[]]
  })
}

/**
 * The master export's "DOBs" section — everyone with a birthday, grouped by month
 * (January → December) and ordered by day, shown as DD/MM. Two columns per framed B5 sheet,
 * packed full, the date right-justified to the column edge. `months` = PeopleCollector.byMonth().
 */
export function BirthdayPages({ months }: { months: CollectedPerson[][] }) {
  const sheets = toSheets(buildRows(months))
  return (
    <>
      {sheets.map((cols, p) => (
        <DirectorySheet key={p} side={p % 2 === 0 ? 'right' : 'left'}>
          <div className="apx">
            {p === 0 && (
              <>
                <h1 className="apx-title">Birthdays</h1>
                <div className="apx-sub">Month-wise dates of birth</div>
              </>
            )}
            <div className="apx-cols">
              {cols.map((col, ci) => (
                <div className="apx-col" key={ci}>
                  {col.map((r, i) =>
                    r.kind === 'month' ? (
                      <div className="apx-month" key={i}>{r.label}</div>
                    ) : (
                      <div className="apx-row" key={i}>
                        <span className="apx-name">{r.name}</span>
                        <span className="apx-pages">{r.date}</span>
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
