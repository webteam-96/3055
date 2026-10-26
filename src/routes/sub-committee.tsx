import { createFileRoute } from '@tanstack/react-router'
import { useCommitteeDetails } from '../api/useCommitteeDetails'
import { CommitteeDirectory } from '../components/CommitteeDirectory'
import { ZonalTeamDirectory } from '../components/ZonalTeamDirectory'
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

  const expandRoles = (list: typeof displayMembers) =>
    list.map((m) => ({ ...m, DistrictDesignation: expandDesignation(m.DistrictDesignation || '') }))

  const members = expandRoles(displayMembers)

  const showSubCommittees = !subCommitteeId && (data?.subCommittees ?? []).length > 0
  const showMembers = members.length > 0

  // Web view: just this committee's own cards (sub-committees are the nav cards
  // below). Order and data are untouched.
  const webSections = showMembers ? [{ title: displayTitle, members }] : []

  // Print/PDF view of a MAIN committee: the committee's own cards followed by every
  // sub-committee as its own titled section, so the whole committee prints as one
  // CONTINUOUS run of District-Committee.svg sheets (5 cards/page, section header
  // pills, no page break forced between a committee and its sub-committees). On a
  // sub-committee view (subCommitteeId set) this is just that one section, exactly
  // as before. paginate() in CommitteeDirectory packs the sections across sheets.
  const printSections = [
    ...webSections,
    ...(!subCommitteeId
      ? (data?.subCommittees ?? [])
          .map((sub) => ({
            title: sub.name,
            members: expandRoles(
              (data?.subCommitteeMembers ?? []).filter(
                (m) => String(m.fk_District_sub_Committee_id) === String(sub.pk_District_sub_Committee_id),
              ),
            ),
          }))
          .filter((s) => s.members.length > 0)
      : []),
  ]
  // The Zonal Team renders each zone exactly like the Assistant Governors (Zone
  // wise) page: the AG in a full-length card, the rest of the team 2 per row.
  const isZonalTeam = name === 'Zonal Team'

  // The Zonal Team's MAIN page has NO direct members — every zone is a sub-committee.
  // Build a section per zone so the whole team renders and the PDF actually has pages
  // (previously the main page's print view was empty, so "Download PDF" produced no
  // sheets). On an individual zone view (subCommitteeId set) this stays empty and the
  // single-zone render below is used.
  const zoneSections =
    isZonalTeam && !subCommitteeId
      ? (data?.subCommittees ?? [])
          .map((sub) => ({
            name: sub.name,
            members: expandRoles(
              (data?.subCommitteeMembers ?? []).filter(
                (m) => String(m.fk_District_sub_Committee_id) === String(sub.pk_District_sub_Committee_id),
              ),
            ),
          }))
          .filter((z) => z.members.length > 0)
      : []

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
          {isZonalTeam ? (
            showMembers ? (
              mode === 'web' ? (
                <WebDoc>
                  <ZonalTeamDirectory zoneName={displayTitle} members={members} mode="web" />
                </WebDoc>
              ) : (
                <ZonalTeamDirectory zoneName={displayTitle} members={members} mode="print" />
              )
            ) : mode === 'print' && zoneSections.length ? (
              // Main Zonal Team page (no direct members): emit one framed sheet per zone
              // so the combined PDF contains every zone. Web keeps the zone nav cards.
              zoneSections.map((z, i) => (
                <ZonalTeamDirectory key={i} zoneName={z.name} members={z.members} mode="print" />
              ))
            ) : !showSubCommittees ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No data available.</p>
            ) : null
          ) : mode === 'web' ? (
            showMembers ? (
              <WebDoc>
                <CommitteeDirectory sections={webSections} mode="web" />
              </WebDoc>
            ) : !showSubCommittees ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No data available.</p>
            ) : null
          ) : printSections.length ? (
            <CommitteeDirectory sections={printSections} mode="print" />
          ) : !showSubCommittees ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No data available.</p>
          ) : null}
          {subNav}
        </>
      )}
    </DirectoryPage>
  )
}
