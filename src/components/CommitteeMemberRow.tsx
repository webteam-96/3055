import type { SyntheticEvent } from 'react'
import type { DistrictCommitteeMember } from '../types/api'
import { firstName } from '../utils/firstName'

// Hide a missing/broken photo so the grey person silhouette shows through.
const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none'
}

// Label + value; empty values fall back to an em dash so the label never dangles.
// `multiline` lets a long value wrap to two lines (then ellipsis) — used for
// Classification, which can be wordy; all other fields stay on one line.
function F({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <span className={multiline ? 'cm-f cm-f--multi' : 'cm-f'}>
      <span className="cm-lbl">{label}</span> <span className="cm-val">{value || '—'}</span>
    </span>
  )
}

/** One committee member — full-width navy name header + soft-curved orange role
 *  ribbon, then photo (left) + detail grid (right). Matches Inner Pages Redo p3. */
export function CommitteeMemberRow({ m }: { m: DistrictCommitteeMember }) {
  return (
    <div className="cm-card">
      <div className="cm-head">
        <span className="cm-name">{m.name}</span>
        {m.DistrictDesignation && (
          <div className="cm-role">
            <svg className="cm-role-shape" viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true">
              {/* Concrete fill (= --navy) as an attribute so it survives the bulk
                  export's DOM serialization, which drops CSS-var fills on SVG paths. */}
              <path d="M0,0 C 40,12 60,32 100,44 L0,44 Z" fill="#1a2b5e" />
            </svg>
            <span className="cm-role-text">{m.DistrictDesignation}</span>
          </div>
        )}
      </div>
      <div className="cm-body">
        <div className="cm-photo">
          <div className="cm-photo-box">
            <svg className="cm-silhouette" viewBox="0 0 64 64" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              <circle cx="32" cy="22" r="15" />
              <path d="M3 64 a29 29 0 0 1 58 0 Z" />
            </svg>
            {m.img ? <img src={m.img} alt={m.name} onError={onImgError} /> : null}
          </div>
          <div className="cm-cap">{firstName(m.name)}</div>
        </div>
        <div className="cm-details">
          <div className="cm-line cm-line-2">
            <F label="Contact:" value={m.MobileNumber} />
            <F label="DOB:" value={m.DOB} />
          </div>
          <div className="cm-line">
            <F label="E-mail:" value={m.MailID} />
          </div>
          <div className="cm-line">
            <F label="Home Club:" value={m.ClubName} />
          </div>
          <div className="cm-line">
            <F label="Classification:" value={m.classification || m.Keywords} multiline />
          </div>
          <div className="cm-line cm-line-3">
            <F label="Spouse:" value={firstName(m.SpouseName)} />
            <F label="Spouse DOB:" value={m.SpouseDOB || m.Spouse_DOB} />
            <F label="DOA:" value={m.DOA} />
          </div>
        </div>
      </div>
    </div>
  )
}
