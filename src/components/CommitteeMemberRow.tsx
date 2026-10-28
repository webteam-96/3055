import type { SyntheticEvent } from 'react'
import type { DistrictCommitteeMember } from '../types/api'
import { firstName } from '../utils/firstName'
import { titleCase } from '../utils/titleCase'
import { NoPhoto } from './NoPhoto'
import { IndexMark } from './IndexMark'

// Hide a missing/broken photo so the Rotary-logo placeholder shows through.
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
      {/* mid = stable API profile id so the appendix merges this person across cards. For a
          College-of-Governors card it rides as `memberId`; for an API committee member as
          `pk_member_master_profile_id` — the SAME id, so a past DG's two spellings collapse. */}
      <IndexMark
        name={m.name}
        dob={m.DOBFull || m.DOB}
        mid={(m as { memberId?: number }).memberId ?? m.pk_member_master_profile_id}
      />
      <div className="cm-head">
        <span className="cm-name">{titleCase(m.name)}</span>
        {m.DistrictDesignation && (
          <div className="cm-role">
            <svg className="cm-role-shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {/* S-curve navy tail — the SAME divider as the Club card's Club-ID tab
                  (transcribed from Card Design/Club cards.svg), replacing the old near-
                  straight slant. Concrete fill as an attribute so it survives the bulk
                  export's DOM serialization (CSS-var fills are dropped on SVG paths). */}
              <path
                d="M0,0 C18.78,-1.8 29.82,4.95 36.46,12.16 C53.32,30.18 50.85,58.11 69.35,80.63 C79.85,93.24 91.9,97.75 100,100 L0,100 Z"
                fill="#1a2b5e"
              />
            </svg>
            <span className="cm-role-text">{titleCase(m.DistrictDesignation)}</span>
          </div>
        )}
      </div>
      <div className="cm-body">
        <div className="cm-photo">
          <div className="cm-photo-box">
            <NoPhoto />
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
            <F label="Home Club:" value={titleCase(m.ClubName)} />
          </div>
          <div className="cm-line">
            <F label="Classification:" value={titleCase(m.classification || m.Keywords)} multiline />
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
