import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { renderCommitteeGridToCanvas, gridCanvasToJsPDF } from './renderCommitteeGrid'
import { fetchDistrictCommittee } from '../../api/useDistrictCommittee'
import { fetchCommitteeDetails } from '../../api/useCommitteeDetails'
import { expandDesignation } from '../formatDate'
import { toSafeFilename } from './pdfUtils'
import type { DistrictCommitteeMember } from '../../types/api'
import { CARD_HEADER_COLORS, CARD_BODY_COLORS } from '../../types/api'

const GROUP_ID = '34307'
const YEAR = '2026-2027'

type ProgressCallback = (label: string, current: number, total: number) => void

async function buildCommitteePdfBuffer(
  members: DistrictCommitteeMember[],
  getDesignation: (m: DistrictCommitteeMember) => string,
): Promise<ArrayBuffer | null> {
  if (members.length === 0) return null
  const canvas = await renderCommitteeGridToCanvas(
    members,
    (i) => ({ header: CARD_HEADER_COLORS[i % 4], body: CARD_BODY_COLORS[i % 4] }),
    getDesignation,
  )
  return gridCanvasToJsPDF(canvas).output('arraybuffer')
}

export async function downloadAllCommitteesZip(onProgress: ProgressCallback): Promise<void> {
  const directory = await fetchDistrictCommittee(GROUP_ID, YEAR)
  const execMembers = directory.members
  const categories = directory.categories

  const totalCommittees = 1 + categories.length
  const zip = new JSZip()
  let current = 0

  // 1. Executive Committee
  current++
  onProgress('Executive Committee', current, totalCommittees)
  const execBuffer = await buildCommitteePdfBuffer(
    execMembers,
    (m) => m.DistrictDesignation || 'Member',
  )
  if (execBuffer) zip.file('01_Executive_Committee.pdf', execBuffer)

  // 2. Each district committee category
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    current++
    onProgress(category.name, current, totalCommittees)

    const details = await fetchCommitteeDetails(category.Fk_DistrictCommitteeID, GROUP_ID)
    const allMembers = [
      ...details.directMembers,
      ...details.subCommitteeMembers,
    ].sort((a, b) => (a.ClubName ?? '').localeCompare(b.ClubName ?? ''))

    const buffer = await buildCommitteePdfBuffer(
      allMembers,
      (m) => expandDesignation(m.DistrictDesignation || ''),
    )
    if (buffer) {
      zip.file(`${String(current).padStart(2, '0')}_${toSafeFilename(category.name)}.pdf`, buffer)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'District_3055_All_Committees.zip')
}
