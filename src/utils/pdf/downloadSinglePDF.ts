import { renderMemberToPDF } from './renderMemberToPDF'
import type { DistrictCommitteeMember } from '../../types/api'

function toSafeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
}

export async function downloadSinglePDF(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
  designationOverride?: string,
): Promise<void> {
  const doc = await renderMemberToPDF(member, colors, designationOverride)
  const name = toSafeFilename(member.name || 'Member')
  const desig = toSafeFilename(designationOverride ?? member.DistrictDesignation ?? 'Member')
  doc.save(`Rtn_${name}_${desig}.pdf`)
}
