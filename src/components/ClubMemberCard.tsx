import type { SyntheticEvent } from 'react'
import { firstName } from '../utils/firstName'
import { titleCase } from '../utils/titleCase'
import { useSheetBg } from './SheetBg'
import { NoPhoto } from './NoPhoto'
import './ClubMemberCard.css'

// Hide a missing/broken photo so the Rotary-logo placeholder shows through.
const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none'
}

export interface ClubMemberCardProps {
  /** Header (colored bar) text — the person's designation/role. */
  designation: string
  name: string
  /** Header colour, alternating by row per Card Pattern.svg. */
  variant: 'orange' | 'blue'
  club?: string
  mobile?: string
  email?: string
  dob?: string
  classification?: string
  spouseName?: string
  spouseDob?: string
  doa?: string
  photo?: string
}

const has = (v?: string) => v !== undefined && v.trim() !== ''

function Row({ label, value, multi }: { label: string; value?: string; multi?: boolean }) {
  return (
    <div className={multi ? 'cmc-row cmc-row--multi' : 'cmc-row'}>
      <span className="cmc-lbl">{label}:</span> <span className="cmc-val">{value || '—'}</span>
    </div>
  )
}

/**
 * One member card — ported from Card Design "Card details.svg": a coloured
 * rounded-top header (designation), a cream body with a label/value field grid on
 * the left and a photo + first-name caption on the right. The header colour is set
 * by `variant` (orange / blue), alternated per row by the caller (Card Pattern.svg).
 */
export function ClubMemberCard(p: ClubMemberCardProps) {
  const showSpouse = has(p.spouseName) || has(p.spouseDob)
  const showDoa = has(p.doa)
  // Body matches the sheet's section background (was the uniform cream); the
  // orange/blue header colour is unchanged.
  const sheetBg = useSheetBg()
  return (
    <article className="club-member-card" style={{ background: sheetBg }}>
      <div className={`cmc-head ${p.variant}`}>{p.designation}</div>
      <div className="cmc-body">
        <div className="cmc-fields">
          <Row label="Name" value={titleCase(p.name)} />
          <Row label="Contact" value={p.mobile} />
          <Row label="E-mail" value={p.email} />
          {has(p.club) && <Row label="Club" value={titleCase(p.club)} />}
          <Row label="DOB" value={p.dob} />
          {has(p.classification) && <Row label="Classification" value={titleCase(p.classification)} multi />}
          {showSpouse && <Row label="Spouse Name" value={titleCase(p.spouseName)} />}
          {(showSpouse || showDoa) && (
            <div className="cmc-pair">
              {showSpouse && <Row label="Spouse DOB" value={p.spouseDob} />}
              {showDoa && <Row label="DOA" value={p.doa} />}
            </div>
          )}
        </div>
        <div className="cmc-photo">
          <div className="cmc-pbox">
            <NoPhoto />
            {has(p.photo) ? <img src={p.photo} alt={p.name} onError={onImgError} /> : null}
          </div>
          <div className="cmc-cap">{firstName(p.name)}</div>
        </div>
      </div>
    </article>
  )
}
