/**
 * Renders all committee members in a 2-column grid (exactly matching the web layout)
 * and paginates the result into a jsPDF document.
 *
 * Uses flexbox (not CSS Grid) because html2canvas has unreliable CSS Grid support.
 * Passes image URLs directly and uses useCORS:true so html2canvas can load them.
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { formatDayMonth } from '../formatDate'

// Match the web page content width (auto-container = max-w-[1400px] px-4)
const GRID_WIDTH_PX = 1400
const GRID_PADDING_PX = 16 // px-4 on each side → content = 1368px
const GAP_PX = 16           // gap-4 between cards
const RENDER_SETTLE_MS = 800

// Scale: 300 DPI on 180mm live-area = 2126px canvas width
// 2126 / 1400 ≈ 1.518
export const GRID_SCALE = (180 / 25.4 * 300) / GRID_WIDTH_PX

// PDF page dimensions (mm)
export const PDF_W_MM = 186
export const PDF_H_MM = 246
export const PDF_BLEED = 3
export const PDF_LIVE_W = PDF_W_MM - 2 * PDF_BLEED  // 180
export const PDF_LIVE_H = PDF_H_MM - 2 * PDF_BLEED  // 240

// Height of one PDF page in canvas pixels (240mm at 300 DPI ≈ 2835px)
export const PAGE_CANVAS_H = Math.round(PDF_LIVE_H / 25.4 * 300)

export async function renderCommitteeGridToCanvas(
  members: DistrictCommitteeMember[],
  getColors: (i: number) => { header: string; body: string },
  getDesignation: (m: DistrictCommitteeMember) => string,
): Promise<HTMLCanvasElement> {
  // Content width after padding, minus one gap, divided by 2 columns
  const contentWidth = GRID_WIDTH_PX - 2 * GRID_PADDING_PX  // 1368px
  const cardWidth = (contentWidth - GAP_PX) / 2              // 676px

  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-${GRID_WIDTH_PX + 1}px;top:0;width:${GRID_WIDTH_PX}px;pointer-events:none;`
  document.body.appendChild(container)

  const root = createRoot(container)

  await new Promise<void>(resolve => {
    root.render(
      // Outer padding wrapper (mirrors auto-container px-4)
      createElement(
        'div',
        { style: { padding: `0 ${GRID_PADDING_PX}px`, backgroundColor: '#ffffff' } },
        // Flex row-wrap layout — explicit widths avoid CSS Grid issues in html2canvas
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              gap: `${GAP_PX}px`,
            },
          },
          ...members.map((member, i) =>
            // Each card wrapper: explicit pixel width so both columns are equal
            createElement(
              'div',
              {
                key: i,
                style: { width: `${cardWidth}px`, flexShrink: 0 },
              },
              createElement(MemberCard, {
                designation: getDesignation(member),
                name: member.name || '',
                club: member.ClubName || '',
                mobile: member.MobileNumber || '',
                email: member.MailID || '',
                dob: formatDayMonth(member.DOB),
                doa: formatDayMonth(member.DOA),
                // Pass URL directly — html2canvas loads it via useCORS:true
                photo: member.img || '',
                classification: member.classification || member.Keywords || '',
                spouseName: member.SpouseName || '',
                spouseDob: member.SpouseDOB || member.Spouse_DOB || '',
                // Only pass spousePhoto when a spouse photo URL exists
                spousePhoto: member.SpousePhoto || undefined,
                headerColor: getColors(i).header,
                bodyColor: getColors(i).body,
              })
            )
          )
        )
      )
    )

    Promise.all([
      document.fonts.ready,
      new Promise(r => setTimeout(r, RENDER_SETTLE_MS)),
    ]).then(() => resolve())
  })

  const outerEl = container.firstElementChild as HTMLElement | null
  if (!outerEl) throw new Error('renderCommitteeGridToCanvas: no element rendered')

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(outerEl, {
      scale: GRID_SCALE,
      useCORS: true,        // allows html2canvas to load cross-origin images
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    })
  } finally {
    root.unmount()
    container.remove()
  }

  return canvas
}

export function gridCanvasToJsPDF(canvas: HTMLCanvasElement): jsPDF {
  const totalPages = Math.ceil(canvas.height / PAGE_CANVAS_H)
  const doc = new jsPDF({ unit: 'mm', format: [PDF_W_MM, PDF_H_MM], orientation: 'portrait' })

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage([PDF_W_MM, PDF_H_MM])

    const sy = page * PAGE_CANVAS_H
    const sliceH = Math.min(PAGE_CANVAS_H, canvas.height - sy)

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = PAGE_CANVAS_H
    const ctx = pageCanvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(canvas, 0, sy, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

    doc.addImage(
      pageCanvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      PDF_BLEED,
      PDF_BLEED,
      PDF_LIVE_W,
      PDF_LIVE_H,
    )
  }

  return doc
}
