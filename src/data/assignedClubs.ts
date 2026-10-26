// Single source of truth for each zone's "Assigned Clubs" — the clubs assigned to
// that zone's Assistant Governor, taken verbatim from the
// "R.I.D. 3055 : AGs, Presidents & Secretaries Details" sheet (copy 1 — the current
// one: 104 clubs across 20 zones; Atulya + Elegance are Zone 3). Used by the AG card
// on BOTH the Assistant Governors (Zone wise) page and the Zonal Team page, keyed by
// zone number, so the two never drift. Names are rendered through titleCase() at the
// call site; the lone "Ahm" (R.C. of Ahmedabad) is written "Ahmedabad" for clarity.

export const ASSIGNED_CLUBS: Record<number, string[]> = {
  1: ['Ahm Kankaria', 'Ahmedabad', 'Ahm South', 'Ahm Midtown', 'Ahm Narol'],
  2: ['Ahm Asmita', 'Ahm Sabarmati', 'Ahm Skyline Patron', 'Ahm Shantigram', 'Ahm Skyline Tejaswini', 'Ahm Adarsh'],
  3: ['Ahm Supreme', 'Ahm Sarvam', 'Ahm Cosmopolitan', 'Ahm Synergy', 'Ahm Chandkheda', 'Ahm Elegance', 'Ahm Atulya'],
  4: ['Ahm Metro', 'Ahm Divyam', 'Ahm Elite', 'Ahm Sindhubhavan', 'Ahm Greater', 'Ahm Bikers Paradise', 'Ahm Heritage'],
  5: ['Ahm North', 'Ahm Prahaladnagar', 'Ahm Airport', 'Ahm Skyline Titans', 'Ahm Skyline Capitals', 'Ahm Solitaire'],
  6: ['Ahm West', 'Ahm Skyline', 'Ahm Skyline Platinum', 'Ahm Science City', 'Ahm Skyline Jupiter'],
  7: ['Ahm Nexus', 'Ahm Majesty Stars', 'Ahm Suryoday', 'Ahm Imperial', 'Ahm Supreme Stars'],
  8: ['Ahm Royals', 'Ahm Mahanagar', 'Ahm Riverfront', 'Ahm Vasna', 'Ahm Majesty'],
  9: ['Kalol', 'Kadi', 'Kalol City', 'Dehgam', 'Bechraji'],
  10: ['Gandhinagar', 'Visnagar', 'Visnagar RT', 'Capital Gandhinagar'],
  11: ['Vijapur', 'Himmatnagar', 'Vadali RT', 'Idar', 'Modasa', 'Mansa', 'Himmatnagar Heritage'],
  12: ['Patan', 'Patan City', 'Deodar', 'Mehsana'],
  13: ['Palanpur DC', 'Unjha', 'Palanpur', 'Ambaji'],
  14: ['Palanpur City', 'Deesa Divine', 'Radhanpur', 'Deesa'],
  15: ['Abu Road', 'Mount Abu', 'Sirohi', 'Sheoganj Sumerpur', 'Mount Abu Arbudanchal'],
  16: ['Balotra', 'Raniwara', 'Bhinmal', 'Sanchore', 'Ahore', 'Balotra Ranisa'],
  17: ['Jaiselmer Swarna Nagari', 'Barmer', 'Jalore', 'Jaiselmer Golden City', 'Sayla'],
  18: ['Gandhidham', 'Adipur', 'Bhachau', 'Adipur Samarth'],
  19: ['Bhuj Wallcity', 'Bhuj Flamingo', 'Nakhatrana', 'Bhuj', 'Madhapar'],
  20: ['Mundra Kutch', 'Anjar', 'Mandvi', 'Bhuj Capital', 'Mundra Corporate'],
}

/**
 * The assigned clubs for a zone, given its number (3) or a label that contains it
 * ("Zone 3"). Returns [] when the zone can't be resolved, so callers can render
 * nothing rather than crash.
 */
export function assignedClubsForZone(zone: string | number): string[] {
  const n = typeof zone === 'number' ? zone : parseInt(String(zone).replace(/\D/g, ''), 10)
  return (Number.isFinite(n) && ASSIGNED_CLUBS[n]) || []
}
