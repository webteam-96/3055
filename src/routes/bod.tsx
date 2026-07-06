import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useClubsBOD } from '../api/useClubsBOD'
import { ClubBODCard } from '../components/ClubBODCard'
import { DirectorySheet } from '../components/DirectorySheet'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'
import { Loading } from '../components/Loading'
import { ApiErrorNotice } from '../components/ApiErrorNotice'

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
  const { data: clubs, isLoading, isError, error } = useClubsBOD(GROUP_ID, YEAR)

  const filtered = useMemo(() => {
    if (!clubs) return []
    const q = search.toLowerCase().trim()
    if (!q) return clubs
    return clubs.filter(
      (c) =>
        (c.clubName ?? '').toLowerCase().includes(q) ||
        (c.President_member_name ?? '').toLowerCase().includes(q) ||
        (c.Secreatary_member_name ?? '').toLowerCase().includes(q) ||
        (c.President_member_mobile_no ?? '').toLowerCase().includes(q) ||
        (c.Secreatary_mobile_no ?? '').toLowerCase().includes(q),
    )
  }, [clubs, search])

  const sheets = useMemo(() => chunk(filtered, 2), [filtered])

  if (isLoading) return <Loading label="Loading clubs…" />
  if (isError) return <ApiErrorNotice error={error} fallback="Failed to load clubs." />

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
            {filtered.map((club) => (
              <ClubBODCard key={club.grpID} club={club} />
            ))}
          </WebDoc>
        ) : (
          sheets.map((pair, i) => (
            <DirectorySheet key={i} pageNumber={i + 1} side={i % 2 === 0 ? 'right' : 'left'}>
              <div className="dir-clubs">
                {pair.map((club) => (
                  <ClubBODCard key={club.grpID} club={club} />
                ))}
              </div>
            </DirectorySheet>
          ))
        )
      }
    </DirectoryPage>
  )
}
