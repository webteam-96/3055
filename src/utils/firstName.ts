// Honorifics / titles that must NOT be treated as a person's first name when
// deriving the photo caption (e.g. "Pdg. Dr. Jayprakash Vyas" -> "Jayprakash").
const HONORIFICS = new Set([
  'rtn', 'rtr', 'rti', 'pdg', 'dg', 'dge', 'dgn', 'agn', 'ag', 'ipdg', 'pp', 'ipp', 'pdt',
  'dr', 'prof', 'er', 'ca', 'cs', 'cma', 'adv', 'col', 'capt', 'maj', 'lt', 'gen',
  'mr', 'mrs', 'ms', 'mx', 'miss', 'smt', 'shri', 'sri', 'smt.', 'late', 'sir', 'madam',
])

/** First *name* of a person, skipping any leading honorifics/titles. */
export function firstName(full: string): string {
  const words = (full || '').trim().split(/\s+/).filter(Boolean)
  for (const w of words) {
    const clean = w.replace(/\.+$/, '').toLowerCase()
    if (clean && !HONORIFICS.has(clean)) return w.replace(/\.+$/, '')
  }
  return (words[0] ?? '').replace(/\.+$/, '')
}
