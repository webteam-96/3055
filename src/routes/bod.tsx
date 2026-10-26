import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useClubsBOD } from '../api/useClubsBOD'
import { ClubBODCard } from '../components/ClubBODCard'
import { DirectorySheet } from '../components/DirectorySheet'
import { ReferenceTitlePage } from '../components/ReferencePage'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'
import { Loading } from '../components/Loading'
import { orderClubsByZone } from '../data/zoneClubOrder'

export const Route = createFileRoute('/bod')({
  component: BODPage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function BODPage() {
  const [search, setSearch] = useState('')
  const { data: clubs, isLoading, isError } = useClubsBOD(GROUP_ID, YEAR)

  const filtered = useMemo(() => {
    if (!clubs) return []
    // Rotary Clubs of 3055 only: hide a club whose card carries NO officer info at
    // all — i.e. neither a President nor a Secretary name was added. Clubs that have
    // at least one of the two are kept. Scoped to this section; the shared
    // selectClubsBOD selector (used by club-details and the bulk exports) is untouched.
    const withOfficers = clubs.filter(
      (c) => Boolean((c.President_member_name ?? '').trim()) || Boolean((c.Secreatary_member_name ?? '').trim()),
    )
    const q = search.toLowerCase().trim()
    if (!q) return withOfficers
    return withOfficers.filter(
      (c) =>
        (c.clubName ?? '').toLowerCase().includes(q) ||
        (c.President_member_name ?? '').toLowerCase().includes(q) ||
        (c.Secreatary_member_name ?? '').toLowerCase().includes(q) ||
        (c.President_member_mobile_no ?? '').toLowerCase().includes(q) ||
        (c.Secreatary_mobile_no ?? '').toLowerCase().includes(q),
    )
  }, [clubs, search])

  // Rotary Clubs are ordered ZONE-WISE per the district's "Zonal Data of AGs &
  // Presidents & Secretaries" sheet (see src/data/zoneClubOrder.ts): zone 1's clubs
  // first (in the sheet's order), then zone 2's, … then any club the sheet doesn't list.
  // No zone headings — the cards simply flow in this order. Card data is from the API.
  const ordered = useMemo(() => orderClubsByZone(filtered), [filtered])
  const sheets = useMemo(() => chunk(ordered, 2), [ordered])

  if (isLoading) return <Loading label="Loading clubs…" />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load clubs.</div>

  const searchBox = (
    <div
      className="search-box"
      style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, minWidth: 220 }}
    >
      <i className="fas fa-search" style={{ color: '#666', margin: '0 8px', fontSize: 15 }} />
      <input
        type="text"
        placeholder="Search by name, club…"
        style={{ flex: 1, padding: '8px 10px', fontSize: 14, background: 'transparent', outline: 'none', border: 'none' }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )

  return (
    <DirectoryPage title="Rotary Clubs of 3055" pdfName="Rotary Clubs of 3055 — District 3055" toolbarMiddle={searchBox}>
      {(mode) =>
        filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No clubs found.</p>
        ) : mode === 'web' ? (
          <WebDoc>
            {ordered.map((club) => (
              <ClubBODCard key={club.grpID} club={club} />
            ))}
          </WebDoc>
        ) : (
          <>
            {/* Chapter-style opener: the section title page sits on the right (recto),
                so the club cards then begin on the left (verso) and alternate — the
                same book layout as the combined "Download All" separators. */}
            <ReferenceTitlePage title="Rotary Clubs of District 3055" pageIndex={0} />
            {sheets.map((pair, i) => (
              <DirectorySheet key={i} pageNumber={i + 2} side={i % 2 === 0 ? 'left' : 'right'}>
                <div className="dir-clubs">
                  {pair.map((club) => (
                    <ClubBODCard key={club.grpID} club={club} />
                  ))}
                </div>
              </DirectorySheet>
            ))}
          </>
        )
      }
    </DirectoryPage>
  )
}
