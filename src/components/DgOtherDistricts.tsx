import { Fragment, useLayoutEffect, useRef } from 'react'
import { DirectorySheet } from './DirectorySheet'
import { resolveImg } from '../api/districtDirectory'
import type { DgPerson, OtherDistrict } from '../types/directory'
import type { ViewMode } from '../hooks/useViewMode'
import { firstName } from '../utils/firstName'
import { titleCase } from '../utils/titleCase'
import { NoPhoto } from './NoPhoto'
import './DgOtherDistricts.css'

// Free-text fields shown in Title Case; contact/e-mail/dates are left verbatim.
const CASE_FIELDS = new Set<keyof DgPerson>(['name', 'club', 'classification'])

// Date fields; an all-zero placeholder date (e.g. "00/00", "00/00/0000") means the
// date is unknown — show it blank rather than a meaningless "00/00".
const DATE_FIELDS = new Set<keyof DgPerson>(['dob', 'spouseDob', 'doa'])
const isBlankDate = (s: string) => /0/.test(s) && /^[\s0/.-]*$/.test(s)

const FIELDS: Array<{ key: keyof DgPerson; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'contact', label: 'Contact' },
  { key: 'email', label: 'E-mail' },
  { key: 'club', label: 'Club' },
  { key: 'classification', label: 'Classification' },
  { key: 'dob', label: 'DOB' },
  { key: 'spouseName', label: 'Spouse' },
  { key: 'spouseDob', label: 'Spouse’s DOB' },
  { key: 'doa', label: 'DOA' },
]

// x-offsets of the four photo boxes, in units of the 469.8-wide card artwork
// ("Card Design/Other DG Cards.svg", card origin at its top-left corner).
const PHOTO_X = [16.7, 100.2, 307.1, 390.6]

/**
 * Keeps a value on one line at the design's font size, shrinking it only when
 * it would overflow its column. A wrapped line would grow the fixed-pitch row
 * and push the bottom rows off the fixed-aspect card, so shrinking is the only
 * way to show over-long data without breaking the artwork geometry.
 */
function FitText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return
    const fit = () => {
      el.style.fontSize = ''
      const cs = getComputedStyle(parent)
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const w = el.getBoundingClientRect().width
      if (w > avail && avail > 0) {
        // No lower bound: complete-but-smaller beats overflowing past the card
        // edge, where overflow:hidden would cut the value off entirely.
        const base = parseFloat(getComputedStyle(el).fontSize)
        el.style.fontSize = `${(base * avail) / w}px`
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(parent)
    // Re-fit once the real Petrona metrics are in (fonts may load after mount).
    document.fonts?.ready.then(fit).catch(() => {})
    return () => ro.disconnect()
  }, [text])
  return (
    <span ref={ref} className="dg-fit">
      {text}
    </span>
  )
}

// "No photograph" placeholder (DG data carries no photos) — the Rotary wheel, shared across
// the whole directory. See NoPhoto.
function Silhouette() {
  return <NoPhoto />
}

/**
 * Header artwork lifted verbatim from "Other DG Cards.svg" (paths translated so
 * the card's top-left corner is the origin): the two copper-gradient year tabs
 * with their S-curved inner edges, plus the year / district texts at the
 * artwork's exact positions.
 */
function HeadArt({ districtNo }: { districtNo: string }) {
  const rid = `dg-tab-r-${districtNo}`
  const lid = `dg-tab-l-${districtNo}`
  return (
    <svg className="dg-head-art" viewBox="0 0 469.8 22.3" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={rid} gradientUnits="userSpaceOnUse" x1="469.84" y1="11.17" x2="339.44" y2="11.17">
          <stop offset="0.5469" stopColor="#C5712E" />
          <stop offset="0.8134" stopColor="#F89C5C" />
        </linearGradient>
        <linearGradient id={lid} gradientUnits="userSpaceOnUse" x1="0.01" y1="11.17" x2="130.4" y2="11.17">
          <stop offset="0.5469" stopColor="#C5712E" />
          <stop offset="0.8134" stopColor="#F89C5C" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${rid})`}
        d="M459.9,0H339.4v0.1c5.3-0.4,8.5,1.1,10.3,2.7c4.8,4,4.1,10.2,9.3,15.2c2.9,2.8,6.3,3.8,8.6,4.2h102.1v-11C469.8,5.1,465.4,0,459.9,0z"
      />
      <path
        fill={`url(#${lid})`}
        d="M10,0h120.5v0.1c-5.3-0.4-8.5,1.1-10.3,2.7c-4.8,4-4.1,10.2-9.3,15.2c-2.9,2.8-6.3,3.8-8.6,4.2H0v-11C0,5.1,4.5,0,10,0z"
      />
      {/* fill is set as a presentation ATTRIBUTE (not only via the .dg-h-txt class):
          the html-to-image PDF capture copies HTML `color` but NOT the `fill` CSS
          property onto SVG <text>, so a class-only white fell back to SVG-default
          black in print. The attribute survives the capture's node clone. */}
      <text className="dg-h-txt" fill="#ffffff" x="13.67" y="17.12">2026-27</text>
      <text className="dg-h-txt" fill="#ffffff" x="394.78" y="17.12">2027-28</text>
      <text className="dg-h-txt" fill="#ffffff" x="234.9" y="17.12" textAnchor="middle">DISTRICT {districtNo}</text>
    </svg>
  )
}

function DistrictCard({ d }: { d: OtherDistrict }) {
  return (
    <div className="dg-card">
      <div className="dg-in">
        <div className="dg-head">
          <HeadArt districtNo={d.districtNo} />
        </div>
        <div className="dg-body">
          <div className="dg-strip" />
          {/* Left (2026-27): two separate solo boxes — this-year DG, this-year spouse.
              Right (2027-28): ONE wide holder with the DG+spouse couple photo shown
              whole (no crop) when the record carries `couplePhoto`; otherwise it falls
              back to the two separate next-year boxes (DG, spouse). A real photo shows
              when present (enriched by phone match / PDF crop), else the grey silhouette. */}
          {[d.dgThisYear.photo, d.dgThisYear.spousePhoto].map((raw, i) => {
            const src = resolveImg(raw)
            return (
              <div key={PHOTO_X[i]} className="dg-pbox" style={{ left: `calc(var(--u) * ${PHOTO_X[i]})` }}>
                {src ? <img className="dg-photo" src={src} alt="" /> : <Silhouette />}
              </div>
            )
          })}
          {(() => {
            const couple = resolveImg(d.dgNextYear.couplePhoto)
            if (couple) {
              // Single wide holder (≈5:3) centred across the right pair's space.
              return (
                <div className="dg-pbox dg-pbox-couple">
                  <img className="dg-photo" src={couple} alt="" />
                </div>
              )
            }
            // Fallback: the original two next-year boxes (DG, spouse).
            return [d.dgNextYear.photo, d.dgNextYear.spousePhoto].map((raw, i) => {
              const src = resolveImg(raw)
              return (
                <div key={PHOTO_X[i + 2]} className="dg-pbox" style={{ left: `calc(var(--u) * ${PHOTO_X[i + 2]})` }}>
                  {src ? <img className="dg-photo" src={src} alt="" /> : <Silhouette />}
                </div>
              )
            })
          })()}
          <div className="dg-rows">
            {FIELDS.map((f) => {
              // Spouse name shows the first name only (no Rtn./Dr./Mr. etc. prefix);
              // name/club/classification are Title-Cased; an all-zero date is blanked;
              // the rest stay verbatim.
              const fmt = (v: string | undefined) => {
                const s = v || ''
                if (f.key === 'spouseName') return firstName(s)
                if (CASE_FIELDS.has(f.key)) return titleCase(s)
                if (DATE_FIELDS.has(f.key) && isBlankDate(s)) return ''
                return s
              }
              return (
                <Fragment key={f.key}>
                  <div className="dg-lv"><FitText text={fmt(d.dgThisYear[f.key])} /></div>
                  <div className="dg-lbl">{f.label}</div>
                  <div className="dg-rv"><FitText text={fmt(d.dgNextYear[f.key])} /></div>
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
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
