import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import { renderMemberToCanvas, PDF_PAGE_W_MM, PDF_PAGE_H_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM } from './renderMemberToPDF'
import type { DistrictCommitteeMember } from '../../types/api'
import { toSafeFilename } from './pdfUtils'

export async function downloadBulkPDF(
  members: DistrictCommitteeMember[],
  title: string,
  getColors: (index: number) => { header: string; body: string },
  getDesignation: (member: DistrictCommitteeMember) => string,
  onProgress: (current: number, total: number) => void,
): Promise<void> {
  if (members.length === 0) return

  const zip = new JSZip()

  for (let i = 0; i < members.length; i++) {
    onProgress(i + 1, members.length)
    const member = members[i]
    const designation = getDesignation(member)
    const canvas = await renderMemberToCanvas(member, getColors(i), designation)
    const doc = new jsPDF({ unit: 'mm', format: [PDF_PAGE_W_MM, PDF_PAGE_H_MM], orientation: 'portrait' })
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', PDF_BLEED_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM)
    const name = toSafeFilename(member.name || 'Member')
    const desig = toSafeFilename(designation || 'Member')
    zip.file(`${i + 1}_${name}_${desig}.pdf`, doc.output('arraybuffer'))
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${toSafeFilename(title)}_Cards.zip`)
}
