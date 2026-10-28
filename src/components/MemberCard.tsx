import type { SyntheticEvent } from 'react'
import { rotaryLogo } from './NoPhoto'
import { IndexMark } from './IndexMark'
import { titleCase } from '../utils/titleCase'

// The Rotary-logo "no photograph" placeholder shown when a member/spouse photo is missing
// or fails to load. CONTAIN (not .pro-img's cover) on a white tile, so the round mark reads
// clearly and is never cropped.
const LOGO_STYLE = { objectFit: 'contain', padding: '8%', background: '#fff' } as const
const toLogo = (e: SyntheticEvent<HTMLImageElement>) => {
  const t = e.currentTarget
  if (t.getAttribute('src') === rotaryLogo) return // already the logo — never loop
  t.src = rotaryLogo
  Object.assign(t.style, LOGO_STYLE)
}

interface MemberCardProps {
  designation: string
  name: string
  club?: string
  mobile: string
  email: string
  dob: string
  doa: string
  photo: string
  headerColor: string
  bodyColor: string
  classification?: string
  spouseName?: string
  spouseDob?: string
  spousePhoto?: string
}

const Field = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="pro-name filed">
    <span>{label}:</span> {value ?? ''}
  </div>
)

export function MemberCard({
  designation, name, club, mobile, email, dob, doa, photo,
  headerColor, bodyColor, classification, spouseName, spouseDob, spousePhoto,
}: MemberCardProps) {
  // Show the spouse section only when there's an actual spouse name. Callers pass
  // '' (not undefined) when there's no spouse — and BOD members pass '' on purpose —
  // so treat empty/whitespace-only names as "no spouse" and hide the section entirely.
  const hasSpouse = spouseName !== undefined && spouseName.trim() !== ''

  return (
    <div className="executive-card" style={{ backgroundColor: bodyColor }}>
      <IndexMark name={name} dob={dob} />
      <div className="card-header" style={{ backgroundColor: headerColor }}>
        {designation}
      </div>
      <div style={{ padding: '12px 8px 8px' }}>

        {/* Photo + primary fields */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src={photo || rotaryLogo}
              alt={name}
              className="pro-img"
              style={photo ? undefined : LOGO_STYLE}
              onError={toLogo}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field label="Name" value={titleCase(name)} />
            {club !== undefined && <Field label="Club" value={titleCase(club)} />}
            <Field label="Classification" value={titleCase(classification)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: '7 1 0', minWidth: 0 }}><Field label="M" value={mobile} /></div>
              <div style={{ flex: '5 1 0', minWidth: 0 }}><Field label="DOB" value={dob} /></div>
            </div>
          </div>
        </div>

        {/* Email + DOA (DOA hidden when empty — e.g. BOD members carry no anniversary) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ flex: '9 1 0', minWidth: 0 }}><Field label="Email" value={email} /></div>
          {doa.trim() !== '' && (
            <div style={{ flex: '3 1 0', minWidth: 0 }}><Field label="DOA" value={doa} /></div>
          )}
        </div>

        {/* Spouse section */}
        {hasSpouse && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {spousePhoto !== undefined && (
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={spousePhoto || rotaryLogo}
                    alt="Spouse"
                    className="pro-img"
                    style={spousePhoto ? undefined : LOGO_STYLE}
                    onError={toLogo}
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: '7 1 0', minWidth: 0 }}><Field label="Spouse Name" value={titleCase(spouseName)} /></div>
                  <div style={{ flex: '5 1 0', minWidth: 0 }}><Field label="Spouse DOB" value={spouseDob} /></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
