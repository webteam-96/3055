import { Fragment } from 'react'
import { DirectorySheet } from './DirectorySheet'
import type { DgPerson, OtherDistrict } from '../types/directory'
import type { ViewMode } from '../hooks/useViewMode'
import { firstName } from '../utils/firstName'
import './DgOtherDistricts.css'

const FIELDS: Array<{ key: keyof DgPerson; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'contact', label: 'Contact' },
  { key: 'email', label: 'E-mail' },
  { key: 'club', label: 'Club' },
  { key: 'classification', label: 'Classification' },
  { key: 'dob', label: 'DOB' },
  { key: 'spouseName', label: 'Spouse' },
  { key: 'spouseDob', label: "Spouse's DOB" },
  { key: 'doa', label: 'DOA' },
]

// Grey person-silhouette placeholder (DG data carries no photos) — matches the PDF.
function Silhouette() {
  return (
    <svg className="dg-silhouette" viewBox="0 0 64 64" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <circle cx="32" cy="22" r="15" />
      <path d="M3 64 a29 29 0 0 1 58 0 Z" />
    </svg>
  )
}

function Photos() {
  return (
    <div className="dg-photos">
      <div className="dg-pbox"><Silhouette /></div>
      <div className="dg-pbox"><Silhouette /></div>
    </div>
  )
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function DistrictCard({ d }: { d: OtherDistrict }) {
  return (
    <div className="dg-card">
      <div className="dg-head">
        <span className="dg-yr">2026-27</span>
        <span className="dg-dist">DISTRICT {d.districtNo}</span>
        <span className="dg-yr">2027-28</span>
      </div>
      <div className="dg-grid">
        {/* photo row + the top of the navy label strip */}
        <Photos />
        <div className="dg-lbl dg-strip-top" />
        <Photos />
        {/* aligned value | label | value rows */}
        {FIELDS.map((f) => {
          // Spouse name shows the first name only (no Rtn./Dr./Mr. etc. prefix).
          const fmt = (v: string | undefined) => (f.key === 'spouseName' ? firstName(v || '') : v)
          return (
            <Fragment key={f.key}>
              <div className="dg-lv">{fmt(d.dgThisYear[f.key])}</div>
              <div className="dg-lbl">{f.label}</div>
              <div className="dg-rv">{fmt(d.dgNextYear[f.key])}</div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

/** P4 — other districts' DGs for 2026-27 (left) and 2027-28 (right). */
export function DgOtherDistricts({ districts, mode }: { districts: OtherDistrict[]; mode: ViewMode }) {
  if (mode === 'web') {
    return (
      <div className="dg-sheet">
        {districts.map((d) => (
          <DistrictCard key={d.districtNo} d={d} />
        ))}
      </div>
    )
  }
  const sheets = chunk(districts, 2)
  return (
    <>
      {sheets.map((pair, i) => (
        <DirectorySheet key={i} pageNumber={i + 1} side={i % 2 === 0 ? 'right' : 'left'}>
          <div className="dg-sheet">
            {pair.map((d) => (
              <DistrictCard key={d.districtNo} d={d} />
            ))}
          </div>
        </DirectorySheet>
      ))}
    </>
  )
}
