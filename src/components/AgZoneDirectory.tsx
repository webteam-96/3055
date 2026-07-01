import { DirectorySheet } from './DirectorySheet'
import type { AgZone, AgClub } from '../types/directory'
import type { ViewMode } from '../hooks/useViewMode'
import { firstName } from '../utils/firstName'
import './AgZoneDirectory.css'

// Grey person-silhouette placeholder (AG data carries no photos yet) — the crisp
// grey person icon from the PDF, replacing the faint dummy.jpg.
function Silhouette() {
  return (
    <svg className="ag-silhouette" viewBox="0 0 64 64" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <circle cx="32" cy="22" r="15" />
      <path d="M3 64 a29 29 0 0 1 58 0 Z" />
    </svg>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="ag-field">
      <span className="ag-lbl">{label}</span> <span className="ag-val">{value || '—'}</span>
    </div>
  )
}

/** The AG card — navy header + orange Zone tab + all AG fields + AG/spouse photos. */
function AgCard({ z }: { z: AgZone }) {
  const clubs = z.clubs.map((c) => c.club).join(', ')
  return (
    <div className="ag-card">
      <div className="ag-head">
        <span className="ag-head-title">AG : {z.agName}</span>
        <span className="ag-zone">Zone {z.zone}</span>
      </div>
      <div className="ag-body">
        <div className="ag-info">
          <Field label="Contact:" value={z.agContact} />
          <Field label="E-mail:" value="" />
          <Field label="Home Club:" value="" />
          <Field label="DOB:" value="" />
          <Field label="Classification:" value="" />
          <div className="ag-pair">
            <Field label="Spouse DOB:" value="" />
            <Field label="DOA:" value="" />
          </div>
          <div className="ag-field ag-clubs">
            <span className="ag-lbl">Rotary Clubs:</span> <span className="ag-val">{clubs}</span>
          </div>
        </div>
        <div className="ag-photos">
          <div className="ag-photo">
            <div className="ag-pbox"><Silhouette /></div>
            <div className="ag-cap">{firstName(z.agName)}</div>
          </div>
          <div className="ag-photo">
            <div className="ag-pbox"><Silhouette /></div>
            <div className="ag-cap">Spouse</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** One officer card (President or Secretary) — every design field, blank when
 *  the data is missing, matching the provided design. */
function OfficerCard({
  role,
  club,
  name,
  contact,
  navy,
}: {
  role: string
  club: string
  name: string
  contact: string
  navy: boolean
}) {
  return (
    <div className="agc">
      <div className={`agc-head ${navy ? 'navy' : 'orange'}`}>{role}</div>
      <div className="agc-body">
        <div className="agc-info">
          <Field label="Name:" value={name} />
          <Field label="Contact:" value={contact} />
          <Field label="E-mail:" value="" />
          <Field label="Club:" value={club} />
          <Field label="DOB:" value="" />
          <Field label="Classification:" value="" />
          <Field label="Spouse Name:" value="" />
          <div className="ag-pair">
            <Field label="Spouse DOB:" value="" />
            <Field label="DOA:" value="" />
          </div>
        </div>
        <div className="agc-photo">
          <div className="agc-pbox"><Silhouette /></div>
          <div className="agc-cap">{firstName(name)}</div>
        </div>
      </div>
    </div>
  )
}

// Each club contributes a President card + a Secretary card.
function OfficerGrid({ clubs, startIndex = 0 }: { clubs: AgClub[]; startIndex?: number }) {
  const cards: Array<{ role: string; club: string; name: string; contact: string }> = []
  for (const c of clubs) {
    cards.push({ role: 'President', club: c.club, name: c.presidentName, contact: c.presidentContact })
    cards.push({ role: 'Secretary', club: c.club, name: c.secretaryName, contact: c.secretaryContact })
  }
  return (
    <div className="ag-grid">
      {cards.map((cd, i) => (
        <OfficerCard key={i} {...cd} navy={Math.floor((startIndex + i) / 2) % 2 === 1} />
      ))}
    </div>
  )
}

// Print pagination: AG card + a few clubs on the first sheet of a zone, the rest
// on continuation sheets (with a compact zone header).
interface ZoneSheet {
  z: AgZone
  full: boolean
  clubs: AgClub[]
}
function paginate(zones: AgZone[]): ZoneSheet[] {
  const FIRST = 3
  const CONT = 4
  const out: ZoneSheet[] = []
  for (const z of zones) {
    if (!z.clubs.length) {
      out.push({ z, full: true, clubs: [] })
      continue
    }
    let i = 0
    let first = true
    while (i < z.clubs.length) {
      const take = first ? FIRST : CONT
      out.push({ z, full: first, clubs: z.clubs.slice(i, i + take) })
      i += take
      first = false
    }
  }
  return out
}

/** AG page (Sheet 3 data) in the provided inner-page design. */
export function AgZoneDirectory({ zones, mode }: { zones: AgZone[]; mode: ViewMode }) {
  if (mode === 'web') {
    return (
      <>
        {zones.map((z) => (
          <div className="ag-zoneblock" key={z.zone}>
            <AgCard z={z} />
            <OfficerGrid clubs={z.clubs} />
          </div>
        ))}
      </>
    )
  }

  const sheets = paginate(zones)
  return (
    <>
      {sheets.map((s, i) => (
        <DirectorySheet key={i} pageNumber={s.z.zone} side={i % 2 === 0 ? 'right' : 'left'}>
          <div className="ag-zoneblock">
            {s.full ? (
              <AgCard z={s.z} />
            ) : (
              <div className="ag-contbar">
                Zone {s.z.zone} &nbsp;·&nbsp; AG: {s.z.agName} &nbsp;(contd.)
              </div>
            )}
            <OfficerGrid clubs={s.clubs} />
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
