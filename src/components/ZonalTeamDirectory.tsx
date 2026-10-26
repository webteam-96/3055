import type { SyntheticEvent } from 'react'
import { DirectorySheet } from './DirectorySheet'
import type { DistrictCommitteeMember } from '../types/api'
import type { ViewMode } from '../hooks/useViewMode'
import { firstName } from '../utils/firstName'
import { titleCase } from '../utils/titleCase'
import { assignedClubsForZone } from '../data/assignedClubs'
import { NoPhoto } from './NoPhoto'
// Reuse the Assistant Governors (Zone wise) card design verbatim — same classes,
// same colours, same layout — so a Zonal Team zone renders exactly like an AG zone.
import './AgZoneDirectory.css'

// "No photograph" placeholder — shown behind every photo box so a missing or broken image
// falls back to the Rotary wheel (shared across the whole directory). See NoPhoto.
function Silhouette() {
  return <NoPhoto />
}

// Hide a missing/broken photo so the silhouette behind it shows through.
const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none'
}

// The AG photo boxes only ever held the (absolutely-positioned) silhouette, so the
// shared classes give an <img> no sizing — leaving the silhouette painting on top of
// a real photo. Lay the photo over the box, above the silhouette, so it reads clearly;
// on error it hides (onImgError) and the silhouette shows through again.
const photoStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="ag-field">
      <span className="ag-lbl">{label}</span> <span className="ag-val">{value || '—'}</span>
    </div>
  )
}

/** The zone's Assistant Governor — full-width card, identical to the AG page's
 *  AG card: navy "AG : name" header + orange "Zone N" S-curve tab, fields on the
 *  left, member + spouse photos on the right. */
function ZoneAgCard({ zoneName, m }: { zoneName: string; m: DistrictCommitteeMember }) {
  // The AG's assigned clubs for this zone (from the shared sheet-derived map), keyed
  // by the zone number in zoneName (e.g. "Zone 1"). Shown ONLY on the AG card.
  const assigned = assignedClubsForZone(zoneName).map((c) => titleCase(c))
  return (
    <div className="ag-card">
      <div className="ag-head">
        <span className="ag-head-title">AG : {titleCase(m.name)}</span>
        <div className="ag-zone">
          {/* Curved navy↔orange boundary — the SAME S-curve as the AG page. Inline
              fill so it survives PDF export. */}
          <svg className="ag-zone-shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,0 C18.78,-1.8 29.82,4.95 36.46,12.16 C53.32,30.18 50.85,58.11 69.35,80.63 C79.85,93.24 91.9,97.75 100,100 L0,100 Z"
              fill="#1a2b5e"
            />
          </svg>
          <span className="ag-zone-text">{zoneName}</span>
        </div>
      </div>
      <div className="ag-body">
        <div className="ag-info">
          <Field label="Contact:" value={m.MobileNumber} />
          <Field label="E-mail:" value={m.MailID} />
          <Field label="Home Club:" value={titleCase(m.ClubName)} />
          <Field label="DOB:" value={m.DOB} />
          <Field label="Classification:" value={titleCase(m.classification || m.Keywords)} />
          <div className="ag-pair">
            <Field label="Spouse DOB:" value={m.SpouseDOB || m.Spouse_DOB} />
            <Field label="DOA:" value={m.DOA} />
          </div>
        </div>
        <div className="ag-photos">
          <div className="ag-photo">
            <div className="ag-pbox">
              <Silhouette />
              {m.img ? <img src={m.img} alt={m.name} style={photoStyle} onError={onImgError} /> : null}
            </div>
            <div className="ag-cap">{firstName(m.name)}</div>
          </div>
          <div className="ag-photo">
            <div className="ag-pbox">
              <Silhouette />
              {m.SpousePhoto ? <img src={m.SpousePhoto} alt="Spouse" style={photoStyle} onError={onImgError} /> : null}
            </div>
            <div className="ag-cap">{firstName(m.SpouseName) || 'Spouse'}</div>
          </div>
        </div>
      </div>
      {/* Assigned Clubs — only on the AG card, styled as a field (same font as
          "Spouse DOB:"). Rendered only when the zone resolves to a club list. */}
      {assigned.length > 0 && (
        <div className="ag-field ag-assigned">
          <span className="ag-lbl">Assigned Clubs:</span> <span className="ag-val">{assigned.join(', ')}</span>
        </div>
      )}
    </div>
  )
}

/** One zonal-team member — the AG page's officer (President/Secretary) card, with
 *  the member's role (Trainer, Membership, …) as the header. */
function ZoneMemberCard({ m, navy }: { m: DistrictCommitteeMember; navy: boolean }) {
  return (
    <div className="agc">
      <div className={`agc-head ${navy ? 'navy' : 'orange'}`}>{titleCase(m.DistrictDesignation)}</div>
      <div className="agc-body">
        <div className="agc-info">
          <Field label="Name:" value={titleCase(m.name)} />
          <Field label="Contact:" value={m.MobileNumber} />
          <Field label="E-mail:" value={m.MailID} />
          <Field label="Club:" value={titleCase(m.ClubName)} />
          <Field label="DOB:" value={m.DOB} />
          <Field label="Classification:" value={titleCase(m.classification || m.Keywords)} />
          <Field label="Spouse Name:" value={titleCase(m.SpouseName)} />
          <div className="ag-pair">
            <Field label="Spouse DOB:" value={m.SpouseDOB || m.Spouse_DOB} />
            <Field label="DOA:" value={m.DOA} />
          </div>
        </div>
        <div className="agc-photo">
          <div className="agc-pbox">
            <Silhouette />
            {m.img ? <img src={m.img} alt={m.name} style={photoStyle} onError={onImgError} /> : null}
          </div>
          <div className="agc-cap">{firstName(m.name)}</div>
        </div>
      </div>
    </div>
  )
}

// The non-AG members, 2 per row. Row colour alternates orange → navy by row, so
// the header banding matches the AG page (row 0 orange, row 1 navy, …). `startIndex`
// keeps the banding continuous when a zone's members are split across sheets.
function ZoneMemberGrid({ members, startIndex = 0 }: { members: DistrictCommitteeMember[]; startIndex?: number }) {
  return (
    <div className="ag-grid">
      {members.map((m, i) => (
        <ZoneMemberCard key={i} m={m} navy={Math.floor((startIndex + i) / 2) % 2 === 1} />
      ))}
    </div>
  )
}

/** One Zonal Team zone rendered exactly like an Assistant Governors (Zone wise)
 *  zone: the AG in a full-length card, the rest of the team 2 cards per row. */
export function ZonalTeamDirectory({
  zoneName,
  members,
  mode,
}: {
  zoneName: string
  members: DistrictCommitteeMember[]
  mode: ViewMode
}) {
  // The AG leads the zone; the API orders them first, but locate by designation to
  // be safe, falling back to the first member.
  const agIdx = members.findIndex((m) => /assistant governor/i.test(m.DistrictDesignation))
  const lead = agIdx >= 0 ? agIdx : 0
  const ag = members[lead]
  const rest = members.filter((_, i) => i !== lead)

  // Web: one continuous scrolling block (the screen isn't paginated).
  if (mode === 'web') {
    return (
      <div className="ag-zoneblock">
        {ag && <ZoneAgCard zoneName={zoneName} m={ag} />}
        {rest.length > 0 && <ZoneMemberGrid members={rest} />}
      </div>
    )
  }

  // Print / PDF: a B5 sheet holds the AG card + up to FIRST_PAGE_MEMBERS member cards
  // (6 = 3 rows of two, which fits with room to spare). A zone with more — Zones 15 & 16
  // carry 7, a 4th row that overflows the page — spills its excess onto a continuation
  // sheet (member cards only, no AG card). The continuation sheet's empty space is filled
  // by the master export's filler/ad overlay (it tucks into any content page's empty bottom).
  // Measured live: 5–6 cards (3 rows) fit comfortably, 7 (4 rows) overflow.
  const FIRST_PAGE_MEMBERS = 6
  const CONT_PAGE_MEMBERS = 8 // a continuation sheet has no AG card, so it holds more
  const pages: { members: DistrictCommitteeMember[]; start: number }[] = [
    { members: rest.slice(0, FIRST_PAGE_MEMBERS), start: 0 },
  ]
  for (let i = FIRST_PAGE_MEMBERS; i < rest.length; i += CONT_PAGE_MEMBERS) {
    pages.push({ members: rest.slice(i, i + CONT_PAGE_MEMBERS), start: i })
  }

  const zoneNo = parseInt(zoneName.replace(/\D/g, ''), 10) || 1
  return (
    <>
      {pages.map((pg, p) => (
        <DirectorySheet key={p} side={(zoneNo + p) % 2 === 1 ? 'right' : 'left'}>
          <div className="ag-zoneblock">
            {p === 0 && ag && <ZoneAgCard zoneName={zoneName} m={ag} />}
            {pg.members.length > 0 && <ZoneMemberGrid members={pg.members} startIndex={pg.start} />}
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
