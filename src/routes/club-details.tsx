import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useClubDetails } from '../api/useClubDetails'
import { useClubMembers } from '../api/useClubMembers'
import { MemberCard } from '../components/MemberCard'
import { Loading } from '../components/Loading'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS } from '../types/api'
import { formatDateToDDMM } from '../utils/formatDate'
import dummyImg from '../assets/images/dummy.jpg'

export const Route = createFileRoute('/club-details')({
  component: ClubDetailsPage,
})

const YEAR = '2026-2027'

function ClubDetailsPage() {
  const search = Route.useSearch() as { groupId?: string }
  const groupId = search?.groupId ?? ''
  const [bodOpen, setBodOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const { data: club, isLoading: clubLoading, isError: clubError } = useClubDetails(groupId, YEAR)
  const { data: members, isLoading: membersLoading } = useClubMembers(groupId, YEAR)

  if (clubLoading) return <Loading label="Loading club details…" />
  if (clubError || !club) return <div className="p-8 text-center text-red-500">Failed to load club details.</div>

  const { basicInfo, ag, president, secretary, bod, presidentPhoto } = club

  return (
    <>
      {/* Club Title + Info */}
      <div className="auto-container pt-8 pb-4">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <h2 className="text-2xl font-bold text-[#3b251a]">{basicInfo.Club_Name}</h2>
          <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-[#3b251a]">
          <span><strong>Club ID:</strong> {basicInfo.Club_ID}</span>
          <span><strong>Charter Date:</strong> {formatDateToDDMM(basicInfo.Charter_Date)}</span>
          <span><strong>Membership:</strong> {basicInfo.Membership}</span>
        </div>
      </div>

      {/* AG Card */}
      {ag?.Name && (
        <div className="auto-container mt-6">
          <div className="executive-card" style={{ backgroundColor: '#2F4366' }}>
            <div className="card-header" style={{ backgroundColor: '#8D9FBE' }}>
              {ag.Designation || 'Assistant Governor'}
            </div>
            <div style={{ padding: '12px 8px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <img
                    src={presidentPhoto || dummyImg}
                    alt="AG"
                    className="pro-img"
                    onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pro-name filed"><span>Name:</span> {ag.Name}</div>
                  <div className="pro-name filed"><span>Mobile:</span> {ag.Mobile_number}</div>
                  <div className="pro-name filed"><span>Email:</span> {ag.Emailid}</div>
                  {(ag.Zone_No || ag.ZoneNo) && (
                    <div className="pro-name filed"><span>Zone No:</span> {ag.Zone_No || ag.ZoneNo}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* President + Secretary */}
      <section className="py-8">
        <div className="auto-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {president && (
              <MemberCard
                designation="President"
                name={president.President_name || ''}
                club={basicInfo.Club_Name}
                mobile={president.Mobile_number || ''}
                email={president.President_EmialID || ''}
                dob={formatDateToDDMM(president.President_DOB)}
                doa={formatDateToDDMM(president.DOA)}
                photo={president.President_photo || ''}
                classification={president.Classification || ''}
                spouseName={president.President_spouse_name || ''}
                spouseDob={formatDateToDDMM(president.President_spouse_DOB)}
                spousePhoto={president.President_photo_spouse || ''}
                headerColor="#FFE8C4"
                bodyColor="#E59E2C"
              />
            )}
            {secretary && (
              <MemberCard
                designation="Secretary"
                name={secretary.Secretary_name || ''}
                club={basicInfo.Club_Name}
                mobile={secretary.Mobile_number || ''}
                email={secretary.Secretary_EmialID || ''}
                dob={formatDateToDDMM(secretary.Secretary_DOB)}
                doa={formatDateToDDMM(secretary.DOA)}
                photo={secretary.Secretary_photo || ''}
                classification={secretary.Classification || ''}
                spouseName={secretary.Secretary_spouse_name || ''}
                spouseDob={formatDateToDDMM(secretary.Secretary_spouse_DOB)}
                spousePhoto={secretary.Secretary_photo_spouse || ''}
                headerColor="#FFE8C4"
                bodyColor="#E59E2C"
              />
            )}
          </div>
        </div>
      </section>

      {/* BOD Accordion */}
      <div className="auto-container mb-6">
        <div className="flex justify-center">
          <button onClick={() => setBodOpen(v => !v)} className="theme-btn px-8 py-4 text-center">
            {bodOpen ? '▲' : '▼'} Board of Directors
          </button>
        </div>
        {bodOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {bod.map((member, i) => (
              <MemberCard
                key={i}
                designation={member.Designation || 'Board Member'}
                name={member.Name || ''}
                club={member.ClubName || basicInfo.Club_Name}
                mobile={member.Mobile_number || ''}
                email={member.Emailid || ''}
                dob={formatDateToDDMM(member.member_date_of_birth)}
                doa={formatDateToDDMM(member.member_date_of_wedding)}
                photo={member.member_profile_photo_path || ''}
                classification=""
                spouseName=""
                spouseDob=""
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Members Accordion */}
      <div className="auto-container mb-12">
        <div className="flex justify-center">
          <button onClick={() => setMembersOpen(v => !v)} className="theme-btn px-8 py-4 text-center">
            {membersOpen ? '▲' : '▼'} Members
          </button>
        </div>
        {membersOpen && membersLoading && <Loading label="Loading members…" />}
        {membersOpen && !membersLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {(members ?? []).map((member, i) => (
              <MemberCard
                key={i}
                designation={member.Designation || member.designation || 'Rotarian'}
                name={member.memberName || member.MemberName || ''}
                mobile={member.membermobile || member.MemberMobile || ''}
                email={member.MemberEmail || ''}
                dob={formatDateToDDMM(member.MemberDOB)}
                doa={formatDateToDDMM(member.MemberDOA)}
                photo={member.pic || ''}
                spouseName={member.SpouseName || ''}
                spouseDob={member.SpouseDOB || ''}
                spousePhoto={member.SpousePhoto || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
