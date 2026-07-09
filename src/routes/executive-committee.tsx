import { createFileRoute } from '@tanstack/react-router'
import { useDistrictCommittee } from '../api/useDistrictCommittee'
import { CommitteeDirectory } from '../components/CommitteeDirectory'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'
import { Loading } from '../components/Loading'

export const Route = createFileRoute('/executive-committee')({
  component: ExecutiveCommitteePage,
})

const GROUP_ID = '34307'
const YEAR = '2026-2027'

function ExecutiveCommitteePage() {
  const { data, isLoading, isError } = useDistrictCommittee(GROUP_ID, YEAR)

  if (isLoading) return <Loading label="Loading Executive Committee…" />
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>

  const members = data?.members ?? []
  const sections = [{ title: 'Executive Committee', members }]

  return (
    <DirectoryPage title="Executive Committee" pdfName="Executive Committee — District 3055">
      {(mode) =>
        members.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No data available.</p>
        ) : mode === 'web' ? (
          <WebDoc>
            <CommitteeDirectory sections={sections} mode="web" />
          </WebDoc>
        ) : (
          <CommitteeDirectory sections={sections} mode="print" />
        )
      }
    </DirectoryPage>
  )
}
