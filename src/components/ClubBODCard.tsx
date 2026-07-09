import { Fragment } from 'react'
import type { SyntheticEvent } from 'react'
// QRCodeSVG (not QRCodeCanvas): the bulk PDF rasterizer (html-to-image) hangs
// when it tries to serialize a <canvas>; an inline <svg> QR rasterizes fine.
import { QRCodeSVG } from 'qrcode.react'
import type { ClubBODSummary } from '../types/api'
import { firstName } from '../utils/firstName'
import './ClubBODCard.css'

// When a member photo is missing or fails to load, hide the <img> so the grey
// person silhouette behind it shows through — matching the PDF's placeholder.
const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none'
}

function Photo({ src, caption, alt }: { src: string; caption: string; alt: string }) {
  return (
    <div className="photo">
      <div className="box">
        <svg className="silhouette" viewBox="0 0 64 64" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
          <circle cx="32" cy="22" r="15" />
          <path d="M3 64 a29 29 0 0 1 58 0 Z" />
        </svg>
        {src ? <img src={src} alt={alt} onError={onImgError} /> : null}
      </div>
      <div className="cap">{caption}</div>
    </div>
  )
}

export function ClubBODCard({ club: c }: { club: ClubBODSummary }) {
  // Points at this site's own club-details page so the QR resolves on whatever
  // origin the directory is deployed to (and in dev). Scanning opens the club's
  // full details + members.
  const detailsPath = `/club-details?groupId=${c.grpID}`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const qrLink = `${origin}${detailsPath}`

  // 6 aligned rows: [president value, centre label, secretary value]
  const rows: Array<[string, string, string]> = [
    [c.President_member_mobile_no, 'Contact:',        c.Secreatary_mobile_no],
    [c.President_member_email_id,  'E-mail:',         c.Secreatary_email_id],
    [c.President_Classification,   'Classification:', c.Secreatary_Classification],
    [c.President_DOB,              'DOB:',            c.Secreatary_DOB],
    [c.President_Spouse_DOB,       'Spouse DOB:',     c.Secreatary_Spouse_DOB],
    [c.President_DOA,              'DOA:',            c.Secreatary_DOA],
  ]

  return (
    <article className="club-bod-card">
      {/* S-curve clip for the Club ID tab's left edge — transcribed from
          Card Design/Club cards.svg (orange tab path st2) into objectBoundingBox
          units (0–1) so it scales with the responsive card. */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="club-id-curve" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,1 L0.2183,1 C0.2006,0.9775 0.1743,0.9324 0.1514,0.8063 C0.111,0.5811 0.1164,0.3018 0.0796,0.1216 C0.0651,0.0495 0.041,-0.018 0,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Title bar */}
      <div className="titlebar">
        <div className="club-name">{c.clubName}</div>
        {c.clubRotaryId && <div className="club-id">Club ID: {c.clubRotaryId}</div>}
      </div>

      {/* Info strip */}
      <div className="info">
        <div className="info-grid">
          <div className="row"><span className="lbl">Charter Date:</span> <span className="val">{c.charterDate}</span></div>
          <div className="row"><span className="lbl">Meeting Day &amp; Time:</span> <span className="val">{c.meeting}</span></div>
          <div className="row"><span className="lbl">Member Count:</span> <span className="val">{c.memberCount}</span></div>
          <div className="row"><span className="lbl">Venue:</span> <span className="val">{c.venue}</span></div>
        </div>
        <div className="info-ag">
          <span><span className="lbl">A.G.:</span> <span className="val">{c.AG_Name}</span></span>
          <span><span className="lbl">Zone No:</span> <span className="val">{c.zoneNo}</span></span>
        </div>
      </div>

      {/* Officer panel */}
      <div className="officer">
        {/* Full-width rounded-top gradient band behind the President/Secretary
            names (light → dark → light), matching Club cards.svg. */}
        <div className="off-band" aria-hidden="true" />
        <div className="off-head pres">
          <div className="nm">{c.President_member_name}</div>
          <div className="role">President</div>
        </div>
        <div className="scan c">Scan to<br />know more</div>
        <div className="off-head sec">
          <div className="nm">{c.Secreatary_member_name}</div>
          <div className="role">Secretary</div>
        </div>

        <div className="photos pres">
          <Photo src={c.President_Profile_Photo} caption={firstName(c.President_member_name)} alt={c.President_member_name} />
          <Photo src={c.President_Spouse_Profile_Photo} caption={firstName(c.President_Spouse_member_name) || 'Spouse'} alt="Spouse" />
        </div>
        <div className="qr c">
          <div className="frame"><QRCodeSVG value={qrLink} size={62} /></div>
          <a className="know-more no-print" href={detailsPath}>Know more</a>
        </div>
        <div className="photos sec">
          <Photo src={c.Secreatary_Profile_Photo} caption={firstName(c.Secreatary_member_name)} alt={c.Secreatary_member_name} />
          <Photo src={c.Secreatary_Spouse_Profile_Photo} caption={firstName(c.Secreatary_Spouse_member_name) || 'Spouse'} alt="Spouse" />
        </div>

        {rows.map(([pv, lbl, sv]) => (
          <Fragment key={lbl}>
            <div className="pv">{pv}</div>
            <div className="olbl c">{lbl}</div>
            <div className="sv">{sv}</div>
          </Fragment>
        ))}

        <div className="pad-b" style={{ gridColumn: 1 }} />
        <div className="pad-b c" style={{ gridColumn: 2 }} />
        <div className="pad-b" style={{ gridColumn: 3 }} />
      </div>
    </article>
  )
}
