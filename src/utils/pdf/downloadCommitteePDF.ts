import { jsPDF } from 'jspdf'
import { renderMemberToCanvas, PDF_PAGE_W_MM, PDF_PAGE_H_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM } from './renderMemberToPDF'
import type { DistrictCommitteeMember } from '../../types/api'
import { toSafeFilename } from './pdfUtils'

export async function downloadCommitteePDF(
  members: DistrictCommitteeMember[],
  title: string,
  getColors: (index: number) => { header: string; body: string },
  getDesignation: (member: DistrictCommitteeMember) => string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  if (members.length === 0) return

  const doc = new jsPDF({
    unit: 'mm',
    format: [PDF_PAGE_W_MM, PDF_PAGE_H_MM],
    orientation: 'portrait',
  })

  for (let i = 0; i < members.length; i++) {
    onProgress?.(i + 1, members.length)
    if (i > 0) doc.addPage([PDF_PAGE_W_MM, PDF_PAGE_H_MM])
    const canvas = await renderMemberToCanvas(members[i], getColors(i), getDesignation(members[i]))
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', PDF_BLEED_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM)
  }

  doc.save(`${toSafeFilename(title)}_Committee.pdf`)
}
