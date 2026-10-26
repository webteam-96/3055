import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useClubDetails } from '../api/useClubDetails'
import { useClubMembers } from '../api/useClubMembers'
import { useClubsBOD } from '../api/useClubsBOD'
import { ClubBODCard } from '../components/ClubBODCard'
import { ClubMemberCard } from '../components/ClubMemberCard'
import { Loading } from '../components/Loading'
import { formatDateToDDMM } from '../utils/formatDate'

export const Route = createFileRoute('/club-details')({
  component: ClubDetailsPage,
})

const YEAR = '2026-2027'

// 2 cards per row, colour alternating by ROW — orange row, then blue row, and so
// on — matching Card Pattern.svg. (Card index i → row floor(i/2).)
const rowVariant = (i: number): 'orange' | 'blue' => (Math.floor(i / 2) % 2 === 0 ? 'orange' : 'blue')

function ClubDetailsPage() {
  const search = Route.useSearch() as { groupId?: string | number }
  // TanStack Router's default search parser JSON-parses values, so a numeric
  // `?groupId=32285` arrives as the number 32285. Coerce to a string so the
  // `grpID` lookup below (grpID is always a string) matches.
  const groupId = String(search?.groupId ?? '')
  const [bodOpen, setBodOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const { data: club, isLoading: clubLoading, isError: clubError } = useClubDetails(groupId, YEAR)
  const { data: allClubs } = useClubsBOD(groupId, YEAR)
  const { data: members, isLoading: membersLoading } = useClubMembers(groupId, YEAR)

  if (clubLoading) return <Loading label="Loading club details…" />
  if (clubError || !club) return <div className="p-8 text-center text-red-500">Failed to load club details.</div>

  const { basicInfo, bod } = club
  // The starting details use the exact "Club details.svg" design, which is already
  // implemented by ClubBODCard; pull this club's summary to feed it.
  const summary = (allClubs ?? []).find((c) => c.grpID === groupId)

  return (
    <>
      {/* Header row: club name + Back */}
      <div className="auto-container pt-6 pb-2">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-[#3b251a]">{basicInfo.Club_Name}</h2>
          <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
        </div>
      </div>

      {/* Starting details — Club details.svg design (reuses ClubBODCard). */}
      {summary && (
        <div className="club-detail-doc">
          <ClubBODCard club={summary} />
        </div>
      )}

      {/* Board of Directors — Card details.svg cards, 2 per row, orange/blue by row. */}
      <div className="auto-container mt-8">
        <div className="flex justify-center">
          <button onClick={() => setBodOpen((v) => !v)} className="theme-btn px-8 py-4 text-center">
            {bodOpen ? '▲' : '▼'} Board of Directors
          </button>
        </div>
      </div>
      {bodOpen && (
        <div className="cmc-grid">
          {bod.map((m, i) => (
            <ClubMemberCard
              key={i}
              variant={rowVariant(i)}
              designation={m.Designation || 'Board Member'}
              name={m.Name || ''}
              club={m.ClubName || basicInfo.Club_Name}
              mobile={m.Mobile_number || ''}
              email={m.Emailid || ''}
              dob={formatDateToDDMM(m.member_date_of_birth)}
              doa={formatDateToDDMM(m.member_date_of_wedding)}
              classification={m.classification || ''}
              spouseName={m.SpouseName || ''}
              spouseDob={m.SpouseDOB || ''}
              photo={m.member_profile_photo_path || ''}
            />
          ))}
        </div>
      )}

      {/* Members — Card details.svg cards, 2 per row, orange/blue by row. */}
      <div className="auto-container mt-8 mb-4">
        <div className="flex justify-center">
          <button onClick={() => setMembersOpen((v) => !v)} className="theme-btn px-8 py-4 text-center">
            {membersOpen ? '▲' : '▼'} Members
          </button>
        </div>
      </div>
      {membersOpen && membersLoading && <Loading label="Loading members…" />}
      {membersOpen && !membersLoading && (
        <div className="cmc-grid mb-12">
          {(members ?? []).map((m, i) => (
            <ClubMemberCard
              key={i}
              variant={rowVariant(i)}
              designation={m.Designation || m.designation || 'Rotarian'}
              name={m.memberName || m.MemberName || ''}
              mobile={m.membermobile || m.MemberMobile || ''}
              email={m.MemberEmail || ''}
              dob={formatDateToDDMM(m.MemberDOB)}
              doa={formatDateToDDMM(m.MemberDOA)}
              classification={m.classification || ''}
              spouseName={m.SpouseName || ''}
              spouseDob={m.SpouseDOB || ''}
              photo={m.pic || ''}
            />
          ))}
        </div>
      )}
    </>
  )
}
