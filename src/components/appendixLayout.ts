// Shared layout helpers for the appendix (DOBs + Bibliography) sheets.

/** Split a sheet's items into two nearly-equal columns (the left column gets the ceil half). */
export function twoColumns<T>(items: T[]): [T[], T[]] {
  const half = Math.ceil(items.length / 2)
  return [items.slice(0, half), items.slice(half)]
}

/**
 * Fill each sheet to its CAPACITY (the first sheet holds fewer because it carries the title),
 * the last sheet taking whatever remains — so every page is packed full with no wasted space
 * (only the final page may be short). `firstCap`/`contCap` are per-SHEET totals (both columns).
 */
export function packSheets<T>(items: T[], firstCap: number, contCap: number): T[][] {
  const sheets: T[][] = []
  let i = 0
  while (i < items.length) {
    const cap = sheets.length === 0 ? firstCap : contCap
    sheets.push(items.slice(i, i + cap))
    i += cap
  }
  return sheets.length ? sheets : [[]]
}
