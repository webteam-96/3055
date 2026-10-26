// Normalises free-text directory values to Title Case for display, so the cards
// read uniformly regardless of how each member/club typed their data in the source
// system (some arrive ALL CAPS, some lower, some mixed).
//
// This is PRESENTATION ONLY — it is applied at render time on the specific text
// fields (names, club, classification, spouse, designation, venue). It is never
// applied to e-mail, mobile, dates or any value used for search/matching, and it
// does not mutate the underlying data.
//
// It is "smart": a naive capitalise-each-word would corrupt two common cases in
// this dataset, so both are preserved —
//   1. Initials in names:  "K.A. Shyam Kumar", "T.S.D. Menon", "Jayram V."
//   2. Acronyms in classification:  CA, HR, IT, MBBS, LLB, FMCG, …
// The acronym list is an allowlist (below) and can be extended freely.

// Tokens kept fully UPPERCASE when they appear as a standalone word. Degree,
// professional and business acronyms common in this directory. Deliberately
// excludes 2-letter tokens that collide with name honorifics/abbreviations
// (e.g. "Md." for Mohammed, "Ms"), which must stay Title Case.
const ACRONYMS = new Set([
  // Professional / finance
  'CA', 'CS', 'CMA', 'CFA', 'ICWA', 'CPA', 'ACCA',
  // Management / commerce degrees
  'MBA', 'BBA', 'PGDM', 'BCA', 'MCA', 'BCOM', 'MCOM', 'BBM',
  // Engineering / science
  'BE', 'BTECH', 'MTECH', 'BSC', 'MSC', 'PHD', 'BCS',
  // Medical
  'MBBS', 'BDS', 'MDS', 'BHMS', 'BAMS', 'DHMS', 'BPT', 'MPT', 'DNB', 'DM', 'DGO', 'DCH',
  // Law / arts
  'LLB', 'LLM', 'BA', 'MA', 'LLD',
  // Business / tech / roles
  'HR', 'IT', 'PR', 'UI', 'UX', 'SEO', 'CRM', 'ERP', 'BPO', 'KPO', 'SME',
  // NOTE: "MD" is intentionally omitted — it collides with "Md." (Mohammed), a
  // common name prefix in this directory, which must stay Title Case.
  'CEO', 'CFO', 'COO', 'CTO', 'CMO', 'GM', 'VP',
  'FMCG', 'FINTECH', 'NGO', 'LIC', 'PSU',
  // Civil services
  'IAS', 'IPS', 'IRS', 'IFS',
  // Rotary / district
  'RI', 'TRF', 'RYLA', 'CSR', 'PG', 'UG',
])

// Roman numerals kept uppercase (e.g. "Louis XIV"). Single-letter forms (I, V, X)
// are excluded — they are ambiguous with initials, which are handled separately.
const ROMAN = /^(?:II|III|IV|VI|VII|VIII|IX|XI|XII|XIII|XIV|XV)$/i

// A run of single letters joined by dots: "K.A.", "T.S.D.", "B.A", "V." — kept
// uppercase so initials never become "K.a." Requires at least one dot so a plain
// two-letter token like "KA" is NOT mistaken for initials.
const INITIALS = /^[A-Za-z](?:\.[A-Za-z])*\.?$/

/** Capitalise a single token (no internal separators). */
function capToken(tok: string): string {
  if (!tok) return tok
  if (tok.includes('.') && INITIALS.test(tok)) return tok.toUpperCase()
  const alpha = tok.replace(/[^A-Za-z]/g, '').toUpperCase()
  if (alpha && ACRONYMS.has(alpha)) return tok.toUpperCase()
  if (ROMAN.test(tok)) return tok.toUpperCase()
  // Standard: first alphabetic char upper, the rest lower (leading punctuation such
  // as "(" or "\"" is preserved, e.g. "(laptop" -> "(Laptop").
  const lower = tok.toLowerCase()
  return lower.replace(/[a-z]/, (c) => c.toUpperCase())
}

/** Capitalise a whitespace-delimited word, honouring hyphen / slash / ampersand /
 *  comma sub-boundaries ("Mandvi-Kutch", "Sales/Service", "Research&Development",
 *  and comma-run-together values like "NR,KARGIL" -> "Nr,Kargil"). */
function capWord(word: string): string {
  return word
    .split(/([-/&,])/)
    .map((seg) => (/^[-/&,]$/.test(seg) ? seg : capToken(seg)))
    .join('')
}

/**
 * Title-case a display string, preserving acronyms and initials. Whitespace is
 * preserved verbatim. Empty / whitespace-only / nullish input is returned as-is.
 */
export function titleCase(input: string | null | undefined): string {
  const s = input == null ? '' : String(input)
  if (!s.trim()) return s
  return s
    .split(/(\s+)/)
    .map((seg) => (/^\s+$/.test(seg) ? seg : capWord(seg)))
    .join('')
}
