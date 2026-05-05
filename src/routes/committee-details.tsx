import { createFileRoute } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { MemberCard } from '../components/MemberCard'
import { Preloader } from '../components/Preloader'
import { CARD_BODY_COLORS, CARD_HEADER_COLORS, COMMITTEE_COLORS } from '../types/api'
import { formatDayMonth, expandDesignation } from '../utils/formatDate'

// @ts-ignore - TanStack Router types are generated during build
export const Route = createFileRoute('/committee-details')({
  validateSearch: (search: Record<string, unknown>) => ({
    committeeId: (search.committeeId as string) ?? '',
    name: (search.name as string) ?? '',
    subCommitteeId: (search.subCommitteeId as string) ?? '',
    subCommitteeName: (search.subCommitteeName as string) ?? '',
  }),
  component: CommitteeDetailsPage,
})

interface CommitteeDetailsSearch {
  committeeId?: string
  name?: string
  subCommitteeId?: string
  subCommitteeName?: string
}

const GROUP_ID = '34307'

function CommitteeDetailsPage() {
  const search = Route.useSearch() as CommitteeDetailsSearch
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
      <section className="py-6 bg-[#9EDFFD]">
        <div className="auto-container flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-medium text-black">{displayTitle}</h1>
          <button
            onClick={() => window.history.back()}
            className="theme-btn"
          >
            Back
          </button>
        </div>
      </section>

      <section className="py-10">
        <div className="auto-container">
          {showMembers && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {displayMembers.map((record, i) => (
                <MemberCard
                  key={i}
                  designation={expandDesignation(record.DistrictDesignation || '')}
                  name={record.name || ''}
                  club={record.ClubName || ''}
                  mobile={record.MobileNumber || ''}
                  email={record.MailID || ''}
                  dob={formatDayMonth(record.DOB)}
                  doa={formatDayMonth(record.DOA)}
                  address={record.Address || ''}
                  photo={record.img || ''}
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
                  href={`/committee-details?committeeId=${committeeId}&name=${encodeURIComponent(name)}&subCommitteeId=${sub.pk_District_sub_Committee_id}&subCommitteeName=${encodeURIComponent(sub.name)}`}
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
