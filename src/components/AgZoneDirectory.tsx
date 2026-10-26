import { DirectorySheet } from './DirectorySheet'
import type { AgZone, AgClub } from '../types/directory'
import type { ViewMode } from '../hooks/useViewMode'
import { firstName } from '../utils/firstName'
import { titleCase } from '../utils/titleCase'
import { assignedClubsForZone } from '../data/assignedClubs'
import { NoPhoto } from './NoPhoto'
import './AgZoneDirectory.css'

// "No photograph" placeholder (AG data carries no photos yet) — the Rotary wheel, shared
// across the whole directory. See NoPhoto.
function Silhouette() {
  return <NoPhoto />
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="ag-field">
      <span className="ag-lbl">{label}</span> <span className="ag-val">{value || '—'}</span>
    </div>
  )
}

/** The AG card — navy header + orange Zone tab + AG fields + AG/spouse photos, and
 *  an "Assigned Clubs" section at the foot listing the AG's clubs (from the sheet). */
function AgCard({ z }: { z: AgZone }) {
  // Authoritative roster from the shared zone→clubs map (the sheet); fall back to the
  // officer list only if the zone can't be resolved, so the line is never empty.
  const clubs = assignedClubsForZone(z.zone)
  const assigned = (clubs.length ? clubs : z.clubs.map((c) => c.club)).map((c) => titleCase(c))
  return (
    <div className="ag-card">
      <div className="ag-head">
        <span className="ag-head-title">AG : {titleCase(z.agName)}</span>
        <div className="ag-zone">
          {/* Curved navy↔orange boundary — the SAME S-curve as the Club card's
              Club-ID tab (Card Design/Club cards.svg), as a fixed-width navy overlay,
              replacing the old straight slant. Inline fill so it survives PDF export. */}
          <svg className="ag-zone-shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,0 C18.78,-1.8 29.82,4.95 36.46,12.16 C53.32,30.18 50.85,58.11 69.35,80.63 C79.85,93.24 91.9,97.75 100,100 L0,100 Z"
              fill="#1a2b5e"
            />
          </svg>
          <span className="ag-zone-text">Zone {z.zone}</span>
        </div>
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
      {/* Assigned Clubs — the AG's club roster from the AGs/Presidents/Secretaries sheet,
          at the foot of the card, styled as a field (same font as "Spouse DOB:"). */}
      <div className="ag-field ag-assigned">
        <span className="ag-lbl">Assigned Clubs:</span> <span className="ag-val">{assigned.join(', ')}</span>
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
          <Field label="Name:" value={titleCase(name)} />
          <Field label="Contact:" value={contact} />
          <Field label="E-mail:" value="" />
          <Field label="Club:" value={titleCase(club)} />
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
                Zone {s.z.zone} &nbsp;·&nbsp; AG: {titleCase(s.z.agName)} &nbsp;(contd.)
              </div>
            )}
            <OfficerGrid clubs={s.clubs} />
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
