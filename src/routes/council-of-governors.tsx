import { createFileRoute } from '@tanstack/react-router'
import { cogWithApiPhotos } from '../data/councilOfGovernors'
import { useDistrictDirectory, selectMemberPhotos } from '../api/districtDirectory'
import { CommitteeDirectory } from '../components/CommitteeDirectory'
import { DirectoryPage, WebDoc } from '../components/DirectoryPage'

export const Route = createFileRoute('/council-of-governors')({
  component: CouncilOfGovernorsPage,
})

// Council of Governors — the district's past DGs. Static data (see
// src/data/councilOfGovernors.ts), rendered through the SAME card path as the
// Executive Committee (CommitteeDirectory -> CommitteeMemberRow), so the cards are
// visually identical; each DG's term year rides in the role ribbon.
function CouncilOfGovernorsPage() {
  // Each DG's photo is sourced LIVE by member id so it matches their club/committee
  // cards; curated portraits are the fallback while the directory loads (and for the
  // two DGs without an API photo link).
  const { data: photos } = useDistrictDirectory(selectMemberPhotos)
  const members = cogWithApiPhotos(photos)
  const sections = [{ title: 'Council of Governors', members }]

  return (
    <DirectoryPage title="Council of Governors" pdfName="Council of Governors — District 3055">
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
