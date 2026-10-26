import { titleCase } from './titleCase'

// Honorifics / titles that must NOT be treated as a person's first name when
// deriving the photo caption (e.g. "Pdg. Dr. Jayprakash Vyas" -> "Jayprakash").
const HONORIFICS = new Set([
  'rtn', 'rtr', 'rti', 'pdg', 'dg', 'dge', 'dgn', 'agn', 'ag', 'ipdg', 'pp', 'ipp', 'pdt',
  'dr', 'prof', 'er', 'ca', 'cs', 'cma', 'adv', 'col', 'capt', 'maj', 'lt', 'gen',
  'mr', 'mrs', 'ms', 'mx', 'miss', 'smt', 'shri', 'sri', 'smt.', 'late', 'sir', 'madam',
])

// Strip a leading run of glued initials so the given name shows through
// ("K.A.Shyam" -> "Shyam"). If stripping would leave nothing real (the token is
// only initials, e.g. "K.A."), the token is kept as-is.
function stripLeadingInitials(tok: string): string {
  const stripped = tok.replace(/^(?:[A-Za-z]\.)+/, '')
  return /[A-Za-z]{2,}/.test(stripped) ? stripped : tok
}

/** First *name* of a person for a photo caption: the first spelled-out name,
 *  skipping any leading honorifics/titles and any standalone or glued initials
 *  (e.g. "L. B. Kushwaha" -> "Kushwaha", "K.A.Shyam Kumar" -> "Shyam"). The
 *  caption is Title-Cased so it reads uniformly regardless of the source data's
 *  casing ("SHYAM" / "naimish" -> "Shyam" / "Naimish"). */
export function firstName(full: string): string {
  const words = (full || '').trim().split(/\s+/).filter(Boolean)
  for (const w of words) {
    const bare = w.replace(/\.+$/, '')
    const clean = bare.toLowerCase()
    if (!clean || HONORIFICS.has(clean)) continue
    const name = stripLeadingInitials(bare)
    // Skip standalone initials ("L.", "B.", "K.A.") — a lone letter is never a
    // useful caption; return the first token that has a real (spelled-out) name.
    if (/[A-Za-z]{2,}/.test(name)) return titleCase(name)
  }
  // All tokens were honorifics/initials — fall back to the first token as-is.
  return titleCase((words[0] ?? '').replace(/\.+$/, ''))
}
