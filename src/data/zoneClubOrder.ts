import type { ClubBODSummary } from '../types/api'

// Zone-wise arrangement of the Rotary Clubs of District 3055, transcribed from the
// "Zonal Data of AGs & Presidents & Secretaries" sheet of the district's planning
// spreadsheet (For Directory_Separators_Committees). Each zone lists its clubs in the
// sheet's left-to-right order (the AG's club first). Clubs are keyed by the API's
// stable `pk_club_id` (names in comments) so renaming in the API never breaks the
// mapping. This drives ONLY the grouping/order of the Rotary Clubs section — all card
// data still comes from the live directory API.
//
// 104 clubs are placed across 20 zones; the ~6 API clubs not listed in the sheet are
// collected into an "Other Clubs" group at the end (see groupClubsByZone).
export const ZONE_CLUB_ORDER: ReadonlyArray<{ zone: number; clubIds: number[] }> = [
  { zone: 1, clubIds: [32367, 32288, 32302, 32297, 32298] }, // Kankaria (Ahmedabad), Ahmedabad, Ahmedabad South, Ahmedabad Mid Town, Ahmedabad Narol
  { zone: 2, clubIds: [32290, 32393, 35073, 33018, 35120, 32285] }, // Asmita, Sabarmati, Skyline Patron, Shantigram, Skyline Tejasvani, Aadarsh
  { zone: 3, clubIds: [32303, 33293, 32323, 35212, 34832, 37187, 35207] }, // Supreme, Sarvam, Cosmopolitan, Synergy, Chandkheda, Elegance, Atulya
  { zone: 4, clubIds: [32296, 33891, 32291, 35211, 32293, 35717, 34201] }, // Metro, Divyam, Elite, Sindhu Bhavan, Greater, Biker's Paradise, Heritage
  { zone: 5, clubIds: [32299, 32300, 32289, 35123, 35158, 34726] }, // North, Prahaladnagar, Airport, Skyline Titans, Skyline Capitals, Solitaire
  { zone: 6, clubIds: [32306, 34254, 35074, 35210, 35063] }, // West, Skyline, Skyline Platinum, Science City, Skyline Jupiter
  { zone: 7, clubIds: [35209, 34366, 32304, 35208, 35051] }, // Nexus, Majesty Stars, Suryoday, Imperial, Supreme Stars
  { zone: 8, clubIds: [34176, 32294, 32301, 32305, 32295] }, // Royals, Mahanagar, River Front, Vasna, Majesty
  { zone: 9, clubIds: [32365, 32364, 32366, 32324, 35241] }, // Kalol, Kadi, Kalol City, Dahegam, Becharaji
  { zone: 10, clubIds: [32332, 32412, 32413, 32320] }, // Gandhinagar, Visnagar, Visnagar Round Town, Capital Gandhinagar
  { zone: 11, clubIds: [32411, 32333, 33021, 32334, 34834, 32378, 35781] }, // Vijapur, Himatnagar, Vadali Round Town, Idar, Modasa, Mansa, Himatnagar Heritage
  { zone: 12, clubIds: [32389, 32390, 35305, 32379] }, // Patan, Patan City, Deodar, Mehsana
  { zone: 13, clubIds: [32387, 32410, 32385, 32307] }, // Palanpur Diamond City, Unjha, Palanpur, Ambaji
  { zone: 14, clubIds: [32386, 33145, 32391, 32326] }, // Palanpur City, Deesa Divine, Radhanpur, Deesa
  { zone: 15, clubIds: [32286, 32381, 35583, 35577, 34927] }, // Abu Road, Mount Abu, Sirohi, Sheoganj Sumerpur, Mount Abu Arbudanchal
  { zone: 16, clubIds: [32309, 33899, 33886, 33893, 35237, 33901] }, // Balotra, Raniwara, Bhinmal, Sanchore, Balotra Rani sa, Ahore
  { zone: 17, clubIds: [32362, 33345, 32363, 34339, 35571] }, // Jaisalmer Swarn Nagari, Barmer, Jalore, Jaisalmer Goldencity, Sayla
  { zone: 18, clubIds: [32331, 32287, 32311, 35181] }, // Gandhidham, Adipur Kutch, Bhachau, Adipur Samarth
  { zone: 19, clubIds: [32317, 32316, 35491, 32314, 34838] }, // Bhuj Wall City, Bhuj Flamingo, Nakhatrana, Bhuj, Madhapar
  { zone: 20, clubIds: [32382, 32308, 32315, 33881, 32377] }, // Mundra Kutch, Anjar, Bhuj Capital, Mundra Corporate, Mandvi-Kutch
]

// Title used for the trailing group of clubs that the sheet does not place in any zone.
export const OTHER_CLUBS_TITLE = 'Other Clubs'

export interface ClubZoneGroup {
  /** Zone number, or null for the trailing "Other Clubs" group. */
  zone: number | null
  /** Display title, e.g. "Zone 1" or "Other Clubs". */
  title: string
  clubs: ClubBODSummary[]
}

// clubId -> zone number, built once from the table above.
const ZONE_BY_CLUB_ID = new Map<string, number>()
for (const { zone, clubIds } of ZONE_CLUB_ORDER) {
  for (const id of clubIds) ZONE_BY_CLUB_ID.set(String(id), zone)
}

/**
 * Group an (already-filtered) list of club summaries into zone sections, ordered and
 * sequenced exactly as the spreadsheet lists them. Clubs not present in the input are
 * skipped (so a zone with none of its clubs is omitted); clubs not placed by the sheet
 * are collected, in their incoming order, into a final "Other Clubs" group. Each club
 * appears exactly once.
 */
export function groupClubsByZone(clubs: ClubBODSummary[]): ClubZoneGroup[] {
  const byId = new Map<string, ClubBODSummary>()
  for (const c of clubs) if (c.clubId) byId.set(String(c.clubId), c)

  const groups: ClubZoneGroup[] = []
  const placed = new Set<string>()
  for (const { zone, clubIds } of ZONE_CLUB_ORDER) {
    const members: ClubBODSummary[] = []
    for (const id of clubIds) {
      const key = String(id)
      const club = byId.get(key)
      if (club && !placed.has(key)) {
        members.push(club)
        placed.add(key)
      }
    }
    if (members.length) groups.push({ zone, title: `Zone ${zone}`, clubs: members })
  }

  const others = clubs.filter((c) => !c.clubId || !placed.has(String(c.clubId)))
  if (others.length) groups.push({ zone: null, title: OTHER_CLUBS_TITLE, clubs: others })

  return groups
}

/**
 * The clubs as a single flat list in the spreadsheet's zone order: all of zone 1's
 * clubs (in order), then zone 2's, … then any "Other Clubs" at the end. No zone
 * headings — callers just lay the cards out (two per sheet) in this order. Used by the
 * /bod view and the PDF/ZIP exports so they all share the same ordering.
 */
export function orderClubsByZone(clubs: ClubBODSummary[]): ClubBODSummary[] {
  return groupClubsByZone(clubs).flatMap((g) => g.clubs)
}
