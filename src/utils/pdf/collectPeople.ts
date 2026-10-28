// People collected while the master "Download Everything" PDF is built: as each framed
// sheet is rasterized we read the hidden `data-iname` / `data-idob` markers that every
// person card emits (see IndexMark) and record the person's name, birthday and the printed
// page number the sheet landed on. Two appendix sections are then rendered from this:
//   • DOBs  — everyone with a birthday, grouped by month (Jan → Dec)
//   • Bibliography — every person, A → Z, with the page number(s) they appear on
// Spouses are deliberately NOT marked, so they never enter either list.

import { titleCase } from '../titleCase'

// Honorifics/prefixes stripped ONLY for the sort & de-dup key, so "Dr. Amit Patel" files
// under A (not D) and merges with "Amit Patel" — the displayed name keeps its prefix.
const HONORIFIC = /^(?:rtn|dr|pp|ipp|pdg|dg|dge|dgn|dge\.?,?|ag|ca|adv|er|rev|prof|mr|mrs|ms|smt|shri|sri)\.?\s+/i
// The same honorifics written as a TRAILING suffix, e.g. "Gyaneshwar Rao Dr." / "Lalit Sharma CA"
// (the College-of-Governors cards use this form) — stripped so they merge with the leading /
// no-honorific spelling of the same name.
const HONORIFIC_SUFFIX = /\s+(?:dr|pp|ipp|pdg|dg|dge|dgn|ca|adv|er|rev|prof)\.?$/i

function sortKey(display: string): string {
  let s = display
  // Strip any run of leading honorifics (e.g. "Pdg. Dr. Jayprakash" → "Jayprakash") …
  for (let prev = ''; prev !== s; ) {
    prev = s
    s = s.replace(HONORIFIC, '')
  }
  // … and any run of trailing ones ("Gyaneshwar Rao Dr." → "Gyaneshwar Rao").
  for (let prev = ''; prev !== s; ) {
    prev = s
    s = s.replace(HONORIFIC_SUFFIX, '')
  }
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

export interface CollectedPerson {
  /** Display name, exactly as it appears on the card. */
  name: string
  /** Birthday as shown on the card (e.g. "19/11"); undefined when the card had none. */
  dob?: string
  /** Sorted, de-duplicated printed page numbers this person appears on. */
  pages: number[]
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/** The month (1-12) from a birthday string, or null if it can't be read. Handles the
 *  card formats "DD/MM", "DD/MM/YYYY" and ISO "YYYY-MM-DD" — the month is the 2nd number
 *  in all three. */
export function monthOf(dob?: string | null): number | null {
  if (!dob) return null
  const parts = String(dob).split(/\D+/).filter(Boolean).map(Number)
  if (parts.length < 2) return null
  const m = parts[1]
  return m >= 1 && m <= 12 ? m : null
}

/** The day-of-month from a birthday string (for ordering within a month). "DD/MM" → 1st
 *  number; ISO "YYYY-MM-DD" (year first, > 31) → 3rd number. 0 when unknown. */
export function dayOf(dob?: string | null): number {
  if (!dob) return 0
  const parts = String(dob).split(/\D+/).filter(Boolean).map(Number)
  if (!parts.length) return 0
  const day = parts[0] > 31 ? parts[2] : parts[0]
  return Number.isFinite(day) ? day : 0
}

interface PersonEntry {
  /** Every display spelling seen for this person (the shortest becomes the label). */
  names: Set<string>
  dob: string
  pages: Set<number>
}

/** Accumulates people across pages, de-duplicating a person who appears under more than one
 *  page or spelling into ONE entry, and merging their page numbers. Two appearances merge
 *  when they share EITHER a stable member id (`mid` — the API profile id, which the College-of-
 *  Governors cards and the API committee cards both carry for the same person) OR a honorific-
 *  insensitive name key. Merging by id catches the same person written two different ways
 *  (e.g. "Naimish Ravani" on the CoG card vs "Naimish N. Ravani" on a committee card). */
export class PeopleCollector {
  // Both the name key and the id key ("#<mid>") of an entry point at the SAME entry object, so a
  // later appearance matching either key finds and extends it. A person seen first by one key
  // and later by another unions the two entries (see add()).
  private keyToEntry = new Map<string, PersonEntry>()
  private entries: PersonEntry[] = []

  add(name: string | null | undefined, dob: string | null | undefined, page: number, mid?: number | null): void {
    // Display name matches the cards (Title Case); merge/sort by the honorific-stripped key.
    const display = titleCase(String(name ?? '').replace(/\s+/g, ' ').trim())
    if (!display) return
    const nameKey = sortKey(display)
    if (!nameKey) return
    const keys = [nameKey]
    if (mid != null && mid > 0) keys.push('#' + mid)

    // Entries already registered under any of this appearance's keys — union them all.
    const found = [...new Set(keys.map((k) => this.keyToEntry.get(k)).filter(Boolean))] as PersonEntry[]
    let e: PersonEntry
    if (found.length === 0) {
      e = { names: new Set(), dob: '', pages: new Set() }
      this.entries.push(e)
    } else {
      e = found[0]
      // Fold any other entries these keys reached into the first (id ∪ name union).
      for (let i = 1; i < found.length; i++) {
        const o = found[i]
        o.names.forEach((n) => e.names.add(n))
        o.pages.forEach((p) => e.pages.add(p))
        if (!e.dob && o.dob) e.dob = o.dob
        for (const [k, v] of this.keyToEntry) if (v === o) this.keyToEntry.set(k, e)
        const idx = this.entries.indexOf(o)
        if (idx >= 0) this.entries.splice(idx, 1)
      }
    }
    e.names.add(display)
    if (!e.dob && dob) e.dob = String(dob).trim()
    if (page > 0) e.pages.add(page)
    for (const k of keys) this.keyToEntry.set(k, e)
  }

  /** The label for an entry: the SHORTEST spelling (usually the one without honorific prefixes). */
  private label(e: PersonEntry): string {
    return [...e.names].sort((a, b) => a.length - b.length || a.localeCompare(b))[0] ?? ''
  }

  /** Every person, name-sorted (A → Z by the honorific-stripped key) for the Bibliography. */
  list(): CollectedPerson[] {
    return this.entries
      .map((e) => ({ name: this.label(e), dob: e.dob || undefined, pages: [...e.pages].sort((a, b) => a - b) }))
      .sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), undefined, { sensitivity: 'base' }))
  }

  /** People grouped by birth month (1-12 → list), each month ordered by day then name.
   *  Only people with a readable birthday are included. */
  byMonth(): CollectedPerson[][] {
    const groups: CollectedPerson[][] = Array.from({ length: 12 }, () => [])
    for (const p of this.list()) {
      const m = monthOf(p.dob)
      if (m) groups[m - 1].push(p)
    }
    for (const g of groups) {
      g.sort((a, b) => dayOf(a.dob) - dayOf(b.dob) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    }
    return groups
  }

  get size(): number {
    return this.entries.length
  }
}
