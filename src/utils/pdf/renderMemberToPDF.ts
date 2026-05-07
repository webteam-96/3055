/**
 * Core PDF render engine.
 * Used by downloadCommitteePDF and downloadBulkPDF — changes here affect all download types.
 * Output: 186×246mm page (180×240mm live area + 3mm bleed on all sides) at ~400 DPI.
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { fetchImageAsBase64 } from './fetchImageAsBase64'
import { formatDayMonth } from '../formatDate'

const CARD_WIDTH_PX = 469 // container width; HTML2CANVAS_SCALE assumes this exact rendered width
const RENDER_SETTLE_MS = 300 // time for React to commit + fonts to load + Tailwind to apply styles
const HTML2CANVAS_SCALE = 6.243  // 186mm / 25.4 * 400 DPI / 469px ≈ 400 DPI
export const PDF_PAGE_W_MM = 186
export const PDF_PAGE_H_MM = 246
export const PDF_BLEED_MM = 3
export const PDF_LIVE_W_MM = PDF_PAGE_W_MM - 2 * PDF_BLEED_MM  // 180
export const PDF_LIVE_H_MM = PDF_PAGE_H_MM - 2 * PDF_BLEED_MM  // 240

export async function renderMemberToCanvas(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
  designationOverride?: string,
): Promise<HTMLCanvasElement> {
  const photoBase64 = member.img ? await fetchImageAsBase64(member.img) : ''
  const spousePhotoBase64 = member.SpousePhoto
    ? await fetchImageAsBase64(member.SpousePhoto)
    : undefined

  // Position off-screen but visible so Tailwind JIT applies all CSS classes
  // and the browser loads web fonts (opacity:0 keeps it invisible to the user)
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:0;top:0;width:${CARD_WIDTH_PX}px;opacity:0;pointer-events:none;z-index:-1;`
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
    // Wait for React to commit, Tailwind to apply classes, and fonts to load
    Promise.all([
      document.fonts.ready,
      new Promise(r => setTimeout(r, RENDER_SETTLE_MS)),
    ]).then(() => resolve())
  })

  const cardEl = container.firstElementChild as HTMLElement | null
  if (!cardEl) throw new Error('renderMemberToCanvas: React did not render a child element')

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(cardEl, {
      scale: HTML2CANVAS_SCALE,
      useCORS: false, // photos are pre-fetched as base64 by fetchImageAsBase64; no cross-origin requests reach html2canvas
      backgroundColor: '#ffffff', // JPEG format requires opaque background; white matches the page bg behind card corners
      logging: false,
    })
  } finally {
    root.unmount()
    container.remove()
  }

  return canvas
}

export async function renderMemberToPDF(
  member: DistrictCommitteeMember,
  colors: { header: string; body: string },
  designationOverride?: string,
): Promise<jsPDF> {
  const canvas = await renderMemberToCanvas(member, colors, designationOverride)
  const doc = new jsPDF({
    unit: 'mm',
    format: [PDF_PAGE_W_MM, PDF_PAGE_H_MM],
    orientation: 'portrait',
  })
  doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', PDF_BLEED_MM, PDF_BLEED_MM, PDF_LIVE_W_MM, PDF_LIVE_H_MM)
  return doc
}
