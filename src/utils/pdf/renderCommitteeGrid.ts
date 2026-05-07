/**
 * Renders all committee members in a 2-column grid (matching the web layout)
 * and paginates the result into a jsPDF document.
 *
 * Mirrors the approach in the 3170 project (pdfGenerators.tsx):
 * - Images loaded via new Image() + canvas (not fetch) through the Vite proxy
 * - flushSync + requestAnimationFrame for reliable DOM paint before capture
 * - container at top:-99999px (not off-left) so CSS classes apply correctly
 * - useCORS:true + allowTaint:true in html2canvas
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { createElement } from 'react'
import { MemberCard } from '../../components/MemberCard'
import type { DistrictCommitteeMember } from '../../types/api'
import { formatDayMonth } from '../formatDate'

const GRID_WIDTH_PX = 1400
const GRID_PADDING_PX = 16
const GAP_PX = 16

export const GRID_SCALE = (180 / 25.4 * 300) / GRID_WIDTH_PX  // ≈ 1.518 → 300 DPI
export const PDF_W_MM = 186
export const PDF_H_MM = 246
export const PDF_BLEED = 3
export const PDF_LIVE_W = PDF_W_MM - 2 * PDF_BLEED   // 180
export const PDF_LIVE_H = PDF_H_MM - 2 * PDF_BLEED   // 240
export const PAGE_CANVAS_H = Math.round(PDF_LIVE_H / 25.4 * 300)  // ≈ 2835px

// Rewrite external image URLs to go through the Vite dev-server proxy.
// Same pattern as the 3170 project's /api/proxy-image route.
function proxyImgUrl(url: string): string {
  if (!url || url === 'null' || url === 'undefined') return ''
  if (url.startsWith('https://rotaryindiaapi.rosteronwheels.com')) {
    return '/img-proxy' + url.slice('https://rotaryindiaapi.rosteronwheels.com'.length)
  }
  return url
}

// Load one image URL → base64 JPEG data URL.
// Uses new Image() + canvas (same pattern as imageToDataUrl in 3170).
// The proxied URL is same-origin so crossOrigin='anonymous' works without taint.
async function imageToDataUrl(url: string): Promise<string> {
  const proxied = proxyImgUrl(url)
  if (!proxied) return ''

  return new Promise(resolve => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    const timer = setTimeout(() => resolve(''), 8000)

    img.onload = () => {
      clearTimeout(timer)
      try {
        const w = img.naturalWidth || 150
        const h = img.naturalHeight || 150
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      } catch {
        resolve('')
      }
    }
    img.onerror = () => { clearTimeout(timer); resolve('') }
    img.src = proxied
  })
}

export async function renderCommitteeGridToCanvas(
  members: DistrictCommitteeMember[],
  getColors: (i: number) => { header: string; body: string },
  getDesignation: (m: DistrictCommitteeMember) => string,
): Promise<HTMLCanvasElement> {
  // Pre-load all photos as base64 data URLs in parallel
  const [photos, spousePhotos] = await Promise.all([
    Promise.all(members.map(m => imageToDataUrl(m.img))),
    Promise.all(members.map(m => imageToDataUrl(m.SpousePhoto))),
  ])

  const contentWidth = GRID_WIDTH_PX - 2 * GRID_PADDING_PX   // 1368px
  const cardWidth = (contentWidth - GAP_PX) / 2               // 676px

  // Position off the TOP (not off the left) — matches 3170 pattern.
  // top:-99999px ensures the container is off-screen but CSS classes still apply.
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;top:-99999px;left:0;width:${GRID_WIDTH_PX}px;pointer-events:none;background:#fff;`
  document.body.appendChild(container)

  const root = createRoot(container)

  // flushSync ensures React commits synchronously before we measure/capture.
  // Two rAF calls give the browser time to paint styles and load images.
  flushSync(() => {
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
                photo: photos[i],
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
  })

  // Wait for two paint frames — same as 3170
  await new Promise(r => requestAnimationFrame(r))
  await new Promise(r => requestAnimationFrame(r))

  // Also wait for all img elements to fire load/error
  const imgs = Array.from(container.querySelectorAll('img'))
  await Promise.allSettled(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(res => {
            img.addEventListener('load', () => res(), { once: true })
            img.addEventListener('error', () => res(), { once: true })
            setTimeout(res, 5000)
          })
    )
  )

  const outerEl = container.firstElementChild as HTMLElement
  const naturalW = container.scrollWidth
  const naturalH = container.scrollHeight

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(outerEl, {
      scale: GRID_SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: naturalW,
      height: naturalH,
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
