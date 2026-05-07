/**
 * Renders all committee members in a 2-column grid (matching the web layout)
 * and paginates the result into a jsPDF document.
 *
 * Images are pre-fetched as base64 data URLs before mounting so html2canvas
 * never makes a cross-origin request — CORS is bypassed entirely.
 * Layout uses flexbox (not CSS Grid) because html2canvas has unreliable Grid support.
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { formatDayMonth } from '../formatDate'

const GRID_WIDTH_PX = 1400
const GRID_PADDING_PX = 16
const GAP_PX = 16
const IMAGE_FETCH_TIMEOUT_MS = 8000
const RENDER_SETTLE_MS = 400

export const GRID_SCALE = (180 / 25.4 * 300) / GRID_WIDTH_PX  // ≈ 1.518 → 300 DPI
export const PDF_W_MM = 186
export const PDF_H_MM = 246
export const PDF_BLEED = 3
export const PDF_LIVE_W = PDF_W_MM - 2 * PDF_BLEED   // 180
export const PDF_LIVE_H = PDF_H_MM - 2 * PDF_BLEED   // 240
export const PAGE_CANVAS_H = Math.round(PDF_LIVE_H / 25.4 * 300)  // ≈ 2835px

// Fetch one image URL → base64 data URL.
// Uses a timed fetch so a slow/dead URL doesn't block the whole render.
async function fetchBase64(url: string): Promise<string> {
  if (!url) return ''
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), IMAGE_FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return ''
    const blob = await res.blob()
    return await new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

export async function renderCommitteeGridToCanvas(
  members: DistrictCommitteeMember[],
  getColors: (i: number) => { header: string; body: string },
  getDesignation: (m: DistrictCommitteeMember) => string,
): Promise<HTMLCanvasElement> {
  // Pre-fetch all member + spouse photos in parallel as base64 data URLs.
  // html2canvas sees data: src attributes — zero cross-origin requests.
  const [photos, spousePhotos] = await Promise.all([
    Promise.all(members.map(m => fetchBase64(m.img))),
    Promise.all(members.map(m => fetchBase64(m.SpousePhoto))),
  ])

  const contentWidth = GRID_WIDTH_PX - 2 * GRID_PADDING_PX   // 1368px
  const cardWidth = (contentWidth - GAP_PX) / 2               // 676px

  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-${GRID_WIDTH_PX + 1}px;top:0;width:${GRID_WIDTH_PX}px;pointer-events:none;`
  document.body.appendChild(container)

  const root = createRoot(container)

  await new Promise<void>(resolve => {
    root.render(
      createElement(
        'div',
        { style: { padding: `0 ${GRID_PADDING_PX}px`, backgroundColor: '#ffffff' } },
        createElement(
          'div',
          { style: { display: 'flex', flexWrap: 'wrap' as const, gap: `${GAP_PX}px` } },
          ...members.map((member, i) =>
            createElement(
              'div',
              { key: i, style: { width: `${cardWidth}px`, flexShrink: 0 } },
              createElement(MemberCard, {
                designation: getDesignation(member),
                name: member.name || '',
                club: member.ClubName || '',
                mobile: member.MobileNumber || '',
                email: member.MailID || '',
                dob: formatDayMonth(member.DOB),
                doa: formatDayMonth(member.DOA),
                photo: photos[i],           // base64 data URL or '' → shows dummyImg
                classification: member.classification || member.Keywords || '',
                spouseName: member.SpouseName || '',
                spouseDob: member.SpouseDOB || member.Spouse_DOB || '',
                spousePhoto: spousePhotos[i] || undefined,
                headerColor: getColors(i).header,
                bodyColor: getColors(i).body,
              })
            )
          )
        )
      )
    )

    // Wait for fonts + a settle period for React to paint
    Promise.all([
      document.fonts.ready,
      new Promise(r => setTimeout(r, RENDER_SETTLE_MS)),
    ]).then(() => resolve())
  })

  // Wait for every img in the container to finish loading (or error out).
  // This covers the dummyImg fallback and any data: URLs that take time to decode.
  const imgs = Array.from(container.querySelectorAll('img'))
  await Promise.allSettled(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(res => {
            img.addEventListener('load', () => res(), { once: true })
            img.addEventListener('error', () => res(), { once: true })
            setTimeout(() => res(), 5000)  // give up after 5s
          })
    )
  )

  const outerEl = container.firstElementChild as HTMLElement | null
  if (!outerEl) throw new Error('renderCommitteeGridToCanvas: no element rendered')

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(outerEl, {
      scale: GRID_SCALE,
      useCORS: false,       // not needed — all images are base64 data URLs
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,      // images are already loaded; no timeout needed
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
