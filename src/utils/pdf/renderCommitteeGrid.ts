/**
 * Renders all committee members in a 2-column grid (exactly matching the web layout)
 * and paginates the result into a jsPDF document.
 *
 * This is the primary PDF engine. One html2canvas call per committee — not per card.
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { fetchImageAsBase64 } from './fetchImageAsBase64'
import { formatDayMonth } from '../formatDate'

// Match the web page container width exactly (auto-container = max-w-[1400px] px-4)
const GRID_WIDTH_PX = 1400
const GRID_PADDING_PX = 16 // px-4 on each side
const RENDER_SETTLE_MS = 600

// Scale so the canvas is 300 DPI on a 180mm live-area PDF page
// 180mm / 25.4 * 300 DPI = 2126px → scale = 2126 / 1400 ≈ 1.518
export const GRID_SCALE = (180 / 25.4 * 300) / GRID_WIDTH_PX

// PDF page dimensions (mm)
export const PDF_W_MM = 186
export const PDF_H_MM = 246
export const PDF_BLEED = 3
export const PDF_LIVE_W = PDF_W_MM - 2 * PDF_BLEED  // 180
export const PDF_LIVE_H = PDF_H_MM - 2 * PDF_BLEED  // 240

// Height of one PDF page in canvas pixels (240mm at 300 DPI)
export const PAGE_CANVAS_H = Math.round(PDF_LIVE_H / 25.4 * 300)

export async function renderCommitteeGridToCanvas(
  members: DistrictCommitteeMember[],
  getColors: (i: number) => { header: string; body: string },
  getDesignation: (m: DistrictCommitteeMember) => string,
): Promise<HTMLCanvasElement> {
  // Fetch all photos in parallel before mounting
  const [photos, spousePhotos] = await Promise.all([
    Promise.all(members.map(m => m.img ? fetchImageAsBase64(m.img) : Promise.resolve(''))),
    Promise.all(members.map(m => m.SpousePhoto ? fetchImageAsBase64(m.SpousePhoto) : Promise.resolve(undefined as string | undefined))),
  ])

  // Off-screen container matching the web layout width
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-${GRID_WIDTH_PX + 1}px;top:0;width:${GRID_WIDTH_PX}px;pointer-events:none;background:#fff;`
  document.body.appendChild(container)

  const root = createRoot(container)

  await new Promise<void>(resolve => {
    root.render(
      createElement(
        'div',
        {
          style: {
            padding: `0 ${GRID_PADDING_PX}px`,
            backgroundColor: '#ffffff',
          },
        },
        createElement(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            },
          },
          ...members.map((member, i) =>
            createElement(MemberCard, {
              key: i,
              designation: getDesignation(member),
              name: member.name || '',
              club: member.ClubName || '',
              mobile: member.MobileNumber || '',
              email: member.MailID || '',
              dob: formatDayMonth(member.DOB),
              doa: formatDayMonth(member.DOA),
              photo: photos[i],
              classification: member.classification || member.Keywords || '',
              spouseName: member.SpouseName || '',
              spouseDob: member.SpouseDOB || member.Spouse_DOB || '',
              spousePhoto: spousePhotos[i],
              headerColor: getColors(i).header,
              bodyColor: getColors(i).body,
            })
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
      useCORS: false,
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

    // Slice this page from the full canvas; pad last page with white
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
