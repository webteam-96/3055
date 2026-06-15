import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useClubsBOD } from '../api/useClubsBOD'
import { cleanText, formatDateToDDMM } from '../utils/formatDate'
import type { ClubBODSummary } from '../types/api'
import dummyImg from '../assets/images/dummy.jpg'

export const Route = createFileRoute('/bod')({
  component: BODPage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function getImg(v: string | null | undefined): string {
  return v && v !== 'null' ? v : dummyImg
}

function get(v: string | null | undefined): string {
  return cleanText(v)
}

const Field = ({ label, value }: { label: string; value: string }) =>
  value ? (
    <div className="pro-name filed"><span>{label}:</span> {value}</div>
  ) : null

function ClubSection({ club }: { club: ClubBODSummary }) {
  const qrLink = `https://3055directory.rizones4567.org/club-details?groupId=${club.grpID}`

  return (
    <section style={{ position: 'relative', padding: '20px 0', margin: '0 10px' }}>
      <div className="auto-container">

        {/* Club Name */}
        <div style={{ position: 'relative', display: 'flex', marginBottom: '15px', justifyContent: 'center' }}>
          <h2 style={{ padding: '10px 24px', background: '#fff', fontSize: '40px', fontWeight: 700, lineHeight: 'normal' }}>
            {get(club.clubName)}
          </h2>
        </div>

        {/* AG Card — full width (only when AG data is available) */}
        {get(club.AG_Name) && (
        <div style={{ marginBottom: '16px' }}>
          <div className="executive-card" style={{ backgroundColor: '#2F4366' }}>
            <div className="card-header" style={{ backgroundColor: '#8D9FBE' }}>
              ASSISTANT GOVERNOR
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={getImg(club.AG_Photo)}
                    className="pro-img"
                    alt="Assistant Governor"
                    onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                  />
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', minWidth: 0 }}>
                  <Field label="Name" value={get(club.AG_Name)} />
                  <Field label="Mobile No." value={get(club.AG_MobileNumber)} />
                  <Field label="Email" value={get(club.AG_EmailID)} />
                  <Field label="DOB" value={formatDateToDDMM(get(club.AG_DOB))} />
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* President | QR | Secretary — 3-column row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'stretch', justifyContent: 'center' }}>

          {/* President */}
          <div style={{ flex: '5 1 280px', maxWidth: 'calc(41.66% - 8px)' }}>
            <div className="executive-card" style={{ backgroundColor: '#E59E2C', minHeight: '280px', marginBottom: 0 }}>
              <div className="card-header" style={{ backgroundColor: '#FFE8C4' }}>PRESIDENT</div>
              <div style={{ padding: '8px 16px 16px' }}>
                {/* Member info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ textAlign: 'center', minWidth: '110px' }}>
                    <img
                      src={getImg(club.President_Profile_Photo)}
                      className="pro-img"
                      alt="President"
                      onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Field label="Name" value={get(club.President_member_name)} />
                    <Field label="Club" value={get(club.clubName)} />
                    <Field label="Mobile No." value={get(club.President_member_mobile_no)} />
                    <Field label="Email" value={get(club.President_member_email_id)} />
                    <Field label="Classification" value={get(club.President_Classification)} />
                  </div>
                </div>
                {/* Spouse info */}
                {get(club.President_Spouse_member_name) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ textAlign: 'center', minWidth: '110px' }}>
                      <img
                        src={getImg(club.President_Spouse_Profile_Photo)}
                        className="pro-img"
                        alt="Spouse"
                        onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Field label="Spouse Name" value={get(club.President_Spouse_member_name)} />
                      <Field label="Spouse DOB" value={formatDateToDDMM(get(club.President_Spouse_DOB))} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div style={{ flex: '2 1 160px', maxWidth: '200px', textAlign: 'center' }}>
            <div className="executive-card" style={{ backgroundColor: '#2F4366', padding: '16px', textAlign: 'center', marginBottom: 0, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <a
                href={`/club-details?groupId=${club.grpID}`}
                className="theme-btn"
                style={{ fontSize: '11px', padding: '6px 10px', textAlign: 'center', lineHeight: '1.4' }}
              >
                TO KNOW MORE<br />SCAN NOW
              </a>
              <QRCodeCanvas value={qrLink} size={100} />
            </div>
          </div>

          {/* Secretary */}
          <div style={{ flex: '5 1 280px', maxWidth: 'calc(41.66% - 8px)' }}>
            <div className="executive-card" style={{ backgroundColor: '#E59E2C', minHeight: '280px', marginBottom: 0 }}>
              <div className="card-header" style={{ backgroundColor: '#FFE8C4' }}>SECRETARY</div>
              <div style={{ padding: '8px 16px 16px' }}>
                {/* Member info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ textAlign: 'center', minWidth: '110px' }}>
                    <img
                      src={getImg(club.Secreatary_Profile_Photo)}
                      className="pro-img"
                      alt="Secretary"
                      onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Field label="Name" value={get(club.Secreatary_member_name)} />
                    <Field label="Club" value={get(club.clubName)} />
                    <Field label="Mobile No." value={get(club.Secreatary_mobile_no)} />
                    <Field label="Email" value={get(club.Secreatary_email_id)} />
                    <Field label="Classification" value={get(club.Secreatary_Classification)} />
                  </div>
                </div>
                {/* Spouse info */}
                {get(club.Secreatary_Spouse_member_name) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ textAlign: 'center', minWidth: '110px' }}>
                      <img
                        src={getImg(club.Secreatary_Spouse_Profile_Photo)}
                        className="pro-img"
                        alt="Spouse"
                        onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Field label="Spouse Name" value={get(club.Secreatary_Spouse_member_name)} />
                      <Field label="Spouse DOB" value={formatDateToDDMM(get(club.Secreatary_Spouse_DOB))} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function BODPage() {
  const [search, setSearch] = useState('')
  const { data: clubs, isLoading, isError } = useClubsBOD(GROUP_ID, YEAR)

  const filtered = useMemo(() => {
    if (!clubs) return []
    const q = search.toLowerCase().trim()
    if (!q) return clubs
    return clubs.filter(c =>
      (c.clubName ?? '').toLowerCase().includes(q) ||
      (c.President_member_name ?? '').toLowerCase().includes(q) ||
      (c.Secreatary_member_name ?? '').toLowerCase().includes(q) ||
      (c.President_member_mobile_no ?? '').toLowerCase().includes(q) ||
      (c.Secreatary_mobile_no ?? '').toLowerCase().includes(q) ||
      (c.AG_Name ?? '').toLowerCase().includes(q)
    )
  }, [clubs, search])

  if (isLoading) return null
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load clubs.</div>

  return (
    <>
      {/* Page Title Banner */}
      <section style={{ position: 'relative', padding: '30px 0', backgroundColor: '#17458F' }}>
        <div className="auto-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Geist', fontSize: '40px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                Rotary Clubs of 3055
              </h1>
            </div>
            <div>
              <button onClick={() => window.history.back()} className="white-btn">
                ← Back
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section style={{ background: '#f8fafc', padding: '16px 0' }}>
        <div className="auto-container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="search-box" style={{ width: '100%', maxWidth: '480px' }}>
            <i className="fas fa-search" style={{ color: '#666', margin: '0 10px', fontSize: '18px' }} />
            <input
              type="text"
              placeholder="Search by name, designation, club..."
              style={{ flex: 1, padding: '10px 12px', fontSize: '15px', background: 'transparent', outline: 'none', border: 'none' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Club Sections */}
      <div style={{ marginTop: '16px', marginBottom: '40px' }}>
        {filtered.map(club => (
          <ClubSection key={club.grpID} club={club} />
        ))}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>No clubs found.</p>
        )}
      </div>
    </>
  )
}
