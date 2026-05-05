import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useClubDetails } from '../api/useClubDetails'
import { useClubMembers } from '../api/useClubMembers'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
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

  if (clubLoading) return <Preloader isLoading />
  if (clubError || !club) return <div className="p-8 text-center text-red-500">Failed to load club details.</div>

  const { basicInfo, ag, president, secretary, bod, presidentPhoto } = club

  return (
    <>
      {/* Page Title */}
      <section className="py-6 bg-[#17458F]">
        <div className="auto-container">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{basicInfo.Club_Name}</h1>
            <button
              onClick={() => window.history.back()}
              className="theme-btn bg-white hover:bg-gray-100"
              style={{ color: 'black' }}
            >
              ← Back
            </button>
          </div>
        </div>
      </section>

      {/* Club Info Bar */}
      <div className="bg-[#C4D4EE] py-4">
        <div className="auto-container">
          <div className="flex flex-wrap gap-6 justify-center text-sm font-medium text-black">
            <span><strong>Club ID:</strong> {basicInfo.Club_ID}</span>
            <span><strong>Charter Date:</strong> {formatDateToDDMM(basicInfo.Charter_Date)}</span>
            <span><strong>Membership:</strong> {basicInfo.Membership}</span>
          </div>
        </div>
      </div>

      {/* AG Card */}
      {ag?.Name && (
        <div className="auto-container mt-6">
          <div className="executive-card" style={{ backgroundColor: '#2F4366' }}>
            <div className="card-header-tab" style={{ backgroundColor: '#8D9FBE' }}>
              {ag.Designation || 'Assistant Governor'}
            </div>
            <div className="p-3 m-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-full md:w-1/4 text-center">
                  <img
                    src={presidentPhoto || dummyImg}
                    alt="AG"
                    className="pro-img-lg"
                    onError={e => { (e.target as HTMLImageElement).src = dummyImg }}
                  />
                </div>
                <div className="flex-1">
                  <div className="filed"><span>Name:</span> {ag.Name}</div>
                  <div className="filed"><span>Mobile:</span> {ag.Mobile_number}</div>
                  <div className="filed"><span>Email:</span> {ag.Emailid}</div>
                  <div className="filed"><span>DOB:</span> {formatDateToDDMM(ag.member_date_of_birth)}</div>
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
                address={president.address || ''}
                photo={president.President_photo || ''}
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
                address={secretary.address || ''}
                photo={secretary.Secretary_photo || ''}
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
          <button
            onClick={() => setBodOpen(v => !v)}
            className="theme-btn px-8 py-4 text-center"
          >
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
                address={member.address || ''}
                photo={member.member_profile_photo_path || ''}
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
          <button
            onClick={() => setMembersOpen(v => !v)}
            className="theme-btn px-8 py-4 text-center"
          >
            {membersOpen ? '▲' : '▼'} Members
          </button>
        </div>
        {membersOpen && !membersLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {(members ?? []).map((member, i) => (
              <MemberCard
                key={i}
                designation={member.designation || member.Designation || 'Rotarian'}
                name={member.memberName || member.MemberName || ''}
                club={member.groupName || ''}
                mobile={member.membermobile || member.MemberMobile || ''}
                email={member.MemberEmail || ''}
                dob={formatDateToDDMM(member.MemberDOB)}
                doa={formatDateToDDMM(member.MemberDOA)}
                address={member.MemberAddress || ''}
                photo={member.pic || ''}
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
