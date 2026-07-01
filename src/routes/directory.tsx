import { createFileRoute } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { COMMITTEE_COLORS } from '../types/api'
import { DirectoryZipButton } from '../components/DirectoryZipButton'

export const Route = createFileRoute('/directory')({
  component: DirectoryPage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function DirectoryPage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)

  if (isLoading) return null
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="auto-container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#3b251a]">Rotary District 3055</h1>
          <DirectoryZipButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/executive-committee" className="avenu-crd" style={{ backgroundColor: '#2F4366' }}>
            <div className="cat-text">Executive Committee</div>
          </a>
          <a href="/bod" className="avenu-crd" style={{ backgroundColor: '#372616' }}>
            <div className="cat-text">Rotary Clubs of District 3055</div>
          </a>
          <a href="/ag-directory" className="avenu-crd" style={{ backgroundColor: '#17458F' }}>
            <div className="cat-text">Assistant Governors (Zone wise)</div>
          </a>
          <a href="/dg-other-districts" className="avenu-crd" style={{ backgroundColor: '#2F5755' }}>
            <div className="cat-text">DGs of Other Districts</div>
          </a>
          {(data?.categories ?? []).map((committee, i) => (
            <a
              key={committee.Fk_DistrictCommitteeID}
              href={`/sub-committee?committeeId=${committee.Fk_DistrictCommitteeID}&name=${encodeURIComponent(committee.name)}`}
              className="avenu-crd"
              style={{ backgroundColor: COMMITTEE_COLORS[i % 4] }}
            >
              <div className="cat-text">{committee.name}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
