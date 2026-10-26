// Types for the directory data that is sourced from JSON files in /public/data
// (derived from the supplied Excel / samples) and fetched at runtime.

export interface AgClub {
  club: string
  presidentName: string
  presidentContact: string
  secretaryName: string
  secretaryContact: string
}

export interface AgZone {
  zone: string
  agName: string
  agContact: string
  clubs: AgClub[]
}

export interface DgPerson {
  name: string
  contact: string
  email: string
  club: string
  classification: string
  dob: string
  spouseName: string
  spouseDob: string
  doa: string
  // Optional photos, enriched from the API by matching `contact` (mobile) to the
  // member record (see scripts/enrich-dg-photos.mjs). Raw API paths — resolve with
  // resolveImg() at render. Absent ⇒ the card shows the grey silhouette placeholder.
  photo?: string
  spousePhoto?: string
  // 2027-28 only: a single wide DG+spouse "couple" photo (≈5:3), used by the card
  // as ONE holder in place of the two separate next-year boxes. High-res and shown
  // whole (no crop), so it beats the small solo/spouse crops. Absent ⇒ fall back to
  // the two `photo`/`spousePhoto` boxes. Raw /dg-pdf/ path — resolve with resolveImg().
  couplePhoto?: string
}

export interface OtherDistrict {
  districtNo: string
  dgThisYear: DgPerson // 2026-27
  dgNextYear: DgPerson // 2027-28
}
