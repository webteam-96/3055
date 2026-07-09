import { createFileRoute } from '@tanstack/react-router'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'
import { DgOtherDistricts } from '../components/DgOtherDistricts'
import { Loading } from '../components/Loading'
import { useOtherDistricts } from '../hooks/useDirectoryJson'

export const Route = createFileRoute('/dg-other-districts')({
  component: DgOtherDistrictsPage,
})

function DgOtherDistrictsPage() {
  const { data: districts, isLoading, isError } = useOtherDistricts()

  return (
    <DirectoryPage title="District Governors — Other Districts" pdfName="District Governors — Other Districts">
      {(mode) =>
        isLoading ? <Loading label="Loading District Governors…" /> : isError || !districts ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>Failed to load data.</p>
        ) : mode === 'web' ? (
          <WebDoc>
            <DgOtherDistricts districts={districts} mode="web" />
          </WebDoc>
        ) : (
          <DgOtherDistricts districts={districts} mode="print" />
        )
      }
    </DirectoryPage>
  )
}
