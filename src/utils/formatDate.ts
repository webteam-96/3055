import { DESIGNATION_MAP } from '../types/api'

export function formatDateToDDMM(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1')
  const date = new Date(cleaned)
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }
  const parts = cleaned.trim().split(' ')
  if (parts.length === 2) {
    const day = parts[0].padStart(2, '0')
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === parts[1].toLowerCase())
    if (monthIndex >= 0) return `${day}/${String(monthIndex + 1).padStart(2, '0')}`
  }
  return dateStr
}

export function formatDayMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  const parts = trimmed.split('/')
  if (parts.length < 2) return ''
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function expandDesignation(designation: string): string {
  const key = designation.substring(0, 3).toUpperCase()
  const expanded = DESIGNATION_MAP[key]
  if (expanded) return `${expanded} (${key})${designation.slice(3)}`
  return designation
}

export function cleanText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return ''
  return text.trim().replace(/\s+/g, ' ')
}
