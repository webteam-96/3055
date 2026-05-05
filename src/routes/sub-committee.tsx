import { createFileRoute } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDayMonth, expandDesignation } from '../utils/formatDate'

// @ts-ignore - TanStack Router types are generated during build
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

  if (isLoading) return <Preloader isLoading />
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
    <>
      <section className="py-6 bg-[#17458F]">
        <div className="auto-container flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-white">{displayTitle}</h1>
          <button
            onClick={() => window.history.back()}
            className="theme-btn bg-white hover:bg-gray-100"
            style={{ color: 'black' }}
          >
            ← Back
          </button>
        </div>
      </section>

      <section className="py-10">
        <div className="auto-container">
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
                  address={member.Address || ''}
                  photo={member.img || ''}
                  headerColor={CARD_HEADER_COLORS[i % 4]}
                  bodyColor={CARD_BODY_COLORS[i % 4]}
                />
              ))}
            </div>
          )}

          {showDivider && (
            <div className="text-center my-10">
              <h2 className="text-2xl font-semibold text-[#2E5339] inline-block px-5">
                Sub Committees
              </h2>
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
                  {sub.name}
                </a>
              ))}
            </div>
          )}

          {!showMembers && !showSubCommittees && (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>
      </section>
    </>
  )
}
