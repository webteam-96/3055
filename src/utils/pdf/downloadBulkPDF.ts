import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { renderMemberToPDF } from './renderMemberToPDF'
import { toSafeFilename } from './pdfUtils'
import type { DistrictCommitteeMember } from '../../types/api'

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
    const doc = await renderMemberToPDF(member, getColors(i), designation)
    const pdfBuffer = doc.output('arraybuffer')
    const name = toSafeFilename(member.name || 'Member')
    const desig = toSafeFilename(designation || 'Member')
    zip.file(`${i + 1}_${name}_${desig}.pdf`, pdfBuffer)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${toSafeFilename(title)}_Cards.zip`)
}
