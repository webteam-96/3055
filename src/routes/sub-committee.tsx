import { createFileRoute } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { MemberCard } from '../components/MemberCard'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDayMonth, expandDesignation } from '../utils/formatDate'


// @ts-ignore
export const Route = createFileRoute('/sub-committee')({
  validateSearch: (search: Record<string, unknown>) => ({
    committeeId: (search.committeeId as string) ?? '',
    name: (search.name as string) ?? '',
    subCommitteeId: (search.subCommitteeId as string) ?? '',
    subCommitteeName: (search.subCommitteeName as string) ?? '',
  }),
  component: SubCommitteePage,
})

interface SubCommitteeSearch {
  committeeId?: string
  name?: string
  subCommitteeId?: string
  subCommitteeName?: string
}

const GROUP_ID = '34307'

function SubCommitteePage() {
  const search = Route.useSearch() as SubCommitteeSearch
  const committeeId = search?.committeeId ?? ''
  const name = search?.name ?? ''
  const subCommitteeId = search?.subCommitteeId ?? ''
  const subCommitteeName = search?.subCommitteeName ?? ''

  const { data, isLoading, isError } = useCommitteeDetails(committeeId, GROUP_ID)

  if (isLoading) return null
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const displayTitle = subCommitteeName || name || 'Committee'

  const displayMembers = (() => {
    if (subCommitteeId && data?.subCommitteeMembers) {
      return [...data.subCommitteeMembers]
        .filter(m => m.fk_District_sub_Committee_id === subCommitteeId)
        .sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
    }
    return [...(data?.directMembers ?? [])].sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))
  })()

  const showSubCommittees = !subCommitteeId && (data?.subCommittees ?? []).length > 0
  const showMembers = displayMembers.length > 0
  const showDivider = !subCommitteeId && showMembers && showSubCommittees

  return (
    <section className="py-10">
      <div className="auto-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#3b251a]">{displayTitle}</h2>
          <button onClick={() => window.history.back()} className="theme-btn">← Back</button>
        </div>

        {showMembers && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {displayMembers.map((member, i) => (
              <MemberCard
                key={i}
                designation={expandDesignation(member.DistrictDesignation || '')}
                name={member.name || ''}
                club={member.ClubName || ''}
                mobile={member.MobileNumber || ''}
                email={member.MailID || ''}
                dob={formatDayMonth(member.DOB)}
                doa={formatDayMonth(member.DOA)}
                photo={member.img || ''}
                classification={member.classification || member.Keywords || ''}
                spouseName={member.SpouseName || ''}
                spouseDob={member.SpouseDOB || member.Spouse_DOB || ''}
                headerColor={CARD_HEADER_COLORS[i % 4]}
                bodyColor={CARD_BODY_COLORS[i % 4]}
              />
            ))}
          </div>
        )}

        {showDivider && (
          <div className="text-center my-8">
            <h2 className="text-2xl font-semibold text-[#2E5339]">Sub Committees</h2>
          </div>
        )}

        {showSubCommittees && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.subCommittees ?? []).map((sub, i) => (
              <a
                key={sub.pk_District_sub_Committee_id}
                href={`/sub-committee?committeeId=${committeeId}&name=${encodeURIComponent(name)}&subCommitteeId=${sub.pk_District_sub_Committee_id}&subCommitteeName=${encodeURIComponent(sub.name)}`}
                className="avenu-crd"
                style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
              >
                <div className="cat-text">{sub.name}</div>
              </a>
            ))}
          </div>
        )}

        {!showMembers && !showSubCommittees && (
          <p className="text-center text-gray-500">No data available.</p>
        )}
      </div>
    </section>
  )
}
