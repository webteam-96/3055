import { createFileRoute } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { CommitteeDirectory } from '../components/CommitteeDirectory'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'
import { COMMITTEE_COLORS } from '../types/api'
import { expandDesignation } from '../utils/formatDate'
import { Loading } from '../components/Loading'

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

  if (isLoading) return <Loading label="Loading committee…" />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const displayTitle = subCommitteeName || name || 'Committee'

  const displayMembers = (() => {
    if (subCommitteeId && data?.subCommitteeMembers) {
      // URL search params arrive as numbers via TanStack Router, but the
      // member's sub-committee id is a string — coerce both before comparing.
      // Order is already by role (Chair → Co-Chair) from the selector.
      return data.subCommitteeMembers.filter(
        (m) => String(m.fk_District_sub_Committee_id) === String(subCommitteeId),
      )
    }
    return data?.directMembers ?? []
  })()

  const members = displayMembers.map((m) => ({ ...m, DistrictDesignation: expandDesignation(m.DistrictDesignation || '') }))
  const sections = [{ title: displayTitle, members }]

  const showSubCommittees = !subCommitteeId && (data?.subCommittees ?? []).length > 0
  const showMembers = members.length > 0

  const subNav = showSubCommittees ? (
    <div className="auto-container no-print" style={{ marginTop: 18 }}>
      {showMembers && (
        <h2 style={{ textAlign: 'center', fontWeight: 600, color: '#2e5339', margin: '12px 0' }}>Sub Committees</h2>
      )}
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
    </div>
  ) : null

  return (
    <DirectoryPage title={displayTitle} pdfName={`${displayTitle} — District 3055`}>
      {(mode) => (
        <>
          {showMembers ? (
            mode === 'web' ? (
              <WebDoc>
                <CommitteeDirectory sections={sections} mode="web" />
              </WebDoc>
            ) : (
              <CommitteeDirectory sections={sections} mode="print" />
            )
          ) : !showSubCommittees ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No data available.</p>
          ) : null}
          {subNav}
        </>
      )}
    </DirectoryPage>
  )
}
