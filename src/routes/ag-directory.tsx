import { createFileRoute } from '@tanstack/react-router'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'
import { AgZoneDirectory } from '../components/AgZoneDirectory'
import { Loading } from '../components/Loading'
import { useAgZones } from '../hooks/useDirectoryJson'

export const Route = createFileRoute('/ag-directory')({
  component: AgDirectoryPage,
})

function AgDirectoryPage() {
  const { data: zones, isLoading, isError } = useAgZones()

  return (
    <DirectoryPage title="Assistant Governors — Zone wise" pdfName="Assistant Governors — District 3055">
      {(mode) =>
        isLoading ? <Loading label="Loading Assistant Governors…" /> : isError || !zones ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>Failed to load AG data.</p>
        ) : mode === 'web' ? (
          <WebDoc>
            <AgZoneDirectory zones={zones} mode="web" />
          </WebDoc>
        ) : (
          <AgZoneDirectory zones={zones} mode="print" />
        )
      }
    </DirectoryPage>
  )
}
