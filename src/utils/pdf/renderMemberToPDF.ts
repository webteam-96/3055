import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { fetchImageAsBase64 } from './fetchImageAsBase64'
import { formatDayMonth } from '../formatDate'

const CARD_WIDTH_PX = 469
const HTML2CANVAS_SCALE = 6.243  // 186mm / 25.4 * 400 DPI / 469px ≈ 400 DPI
const PDF_PAGE_W_MM = 186
const PDF_PAGE_H_MM = 246
const PDF_BLEED_MM = 3
const PDF_LIVE_W_MM = 180
const PDF_LIVE_H_MM = 240

export async function renderMemberToPDF(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
  designationOverride?: string,
): Promise<jsPDF> {
  const photoBase64 = member.img ? await fetchImageAsBase64(member.img) : ''
  const spousePhotoBase64 = member.SpousePhoto
    ? await fetchImageAsBase64(member.SpousePhoto)
    : undefined

  const container = document.createElement('div')
  container.style.cssText = `position:absolute;left:-9999px;top:0;width:${CARD_WIDTH_PX}px;`
  document.body.appendChild(container)

  const root = createRoot(container)

  await new Promise<void>(resolve => {
    root.render(
      createElement(MemberCard, {
        designation: designationOverride ?? member.DistrictDesignation ?? '',
        name: member.name || '',
        club: member.ClubName || '',
        mobile: member.MobileNumber || '',
        email: member.MailID || '',
        dob: formatDayMonth(member.DOB),
        doa: formatDayMonth(member.DOA),
        photo: photoBase64,
        classification: member.classification || member.Keywords || '',
        spouseName: member.SpouseName || '',
        spouseDob: member.SpouseDOB || member.Spouse_DOB || '',
        spousePhoto: spousePhotoBase64,
        headerColor: colors.header,
        bodyColor: colors.body,
      })
    )
    setTimeout(resolve, 150)
  })

  const cardEl = container.firstElementChild as HTMLElement
  const canvas = await html2canvas(cardEl, {
    scale: HTML2CANVAS_SCALE,
    useCORS: false,
    backgroundColor: null,
    logging: false,
  })

  root.unmount()
  container.remove()

  const doc = new jsPDF({
    unit: 'mm',
    format: [PDF_PAGE_W_MM, PDF_PAGE_H_MM],
    orientation: 'portrait',
  })

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', PDF_BLEED_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM)

  return doc
}
