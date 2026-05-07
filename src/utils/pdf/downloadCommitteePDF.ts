import { renderCommitteeGridToCanvas, gridCanvasToJsPDF } from './renderCommitteeGrid'
import type { DistrictCommitteeMember } from '../../types/api'
import { toSafeFilename } from './pdfUtils'

export async function downloadCommitteePDF(
  members: DistrictCommitteeMember[],
  title: string,
  getColors: (i: number) => { header: string; body: string },
  getDesignation: (m: DistrictCommitteeMember) => string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  if (members.length === 0) return

  onProgress?.(0, members.length)
  const canvas = await renderCommitteeGridToCanvas(members, getColors, getDesignation)
  onProgress?.(members.length, members.length)

  const doc = gridCanvasToJsPDF(canvas)
  doc.save(`${toSafeFilename(title)}_Committee.pdf`)
}
