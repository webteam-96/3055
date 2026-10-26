import './ReferencePage.css'
import './PersonalProfilePage.css'
import { useSheetBg } from './SheetBg'

// The blank "PERSONAL PROFILE" form — the first page of the printed directory, filled in
// by hand by whoever owns the copy. Drawn on the directory's own B5 frame so it matches
// the rest of the book: the title is a centred navy banner (the shared `.ref-title`, same
// size/colour as every other page's title), the fields sit centred in the middle of the
// page, and the usage note is a single grey line pinned at the bottom. One static sheet.

/** Fields exactly as the reference, top to bottom. `lines: 2` gives a field two blank
 *  ruled lines (the residential address needs the extra room). */
const FIELDS: { label: string; lines?: number }[] = [
  { label: 'Rotarian' },
  { label: 'Rotary Club' },
  { label: 'Classification' },
  { label: 'Mobile Number' },
  { label: 'Email ID' },
  { label: 'Residential Address', lines: 2 },
  { label: 'Rotary Member Since' },
  { label: 'Rotary ID' },
  { label: 'Current Rotary Position' },
]

export function PersonalProfilePage() {
  const sheetBg = useSheetBg()
  return (
    <article className="ref-page pp-page" style={{ background: sheetBg }}>
      <img className="ref-bg" src="/border-right.svg" alt="" aria-hidden="true" />
      <div className="pp-content">
        <div className="ref-title">PERSONAL PROFILE</div>

        <div className="pp-fields">
          {FIELDS.map((f) => (
            <div className="pp-row" key={f.label}>
              <span className="pp-label">{f.label}</span>
              <span className="pp-dots" />
              {f.lines === 2 ? <span className="pp-dots pp-dots--full" /> : null}
            </div>
          ))}
        </div>

        <p className="pp-note">
          (This directory is meant for the personal use of Rotarians only. It is not for general distribution.)
        </p>
      </div>
    </article>
  )
}
