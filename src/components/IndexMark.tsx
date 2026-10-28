/**
 * A hidden, non-visual marker a person card emits so the master "Download Everything" export
 * can collect WHO appears on each page (for the DOBs + Bibliography appendix pages). It carries
 * the person's raw name and birthday in data-* attributes and is `display:none`, so it never
 * shows on screen or in the rasterized sheet image — the export reads it straight from the DOM
 * (see collectPeople + appendSheetsToPdf). Emitted ONLY for real people, never spouses.
 */
export function IndexMark({ name, dob, mid }: { name?: string | null; dob?: string | null; mid?: number | string | null }) {
  const n = String(name ?? '').trim()
  if (!n) return null
  // `mid` = the person's stable API profile id (when the card has one). The appendix collector
  // merges two appearances that share it, so the same person written two ways (e.g. a past DG's
  // short College-of-Governors name vs their full committee-card name) becomes ONE index entry.
  const m = mid != null && String(mid).trim() !== '' ? String(mid).trim() : undefined
  return (
    <span
      className="index-mark"
      data-iname={n}
      data-idob={String(dob ?? '').trim()}
      {...(m ? { 'data-imid': m } : {})}
      aria-hidden="true"
      style={{ display: 'none' }}
    />
  )
}
