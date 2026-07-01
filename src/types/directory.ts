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
}

export interface OtherDistrict {
  districtNo: string
  dgThisYear: DgPerson // 2026-27
  dgNextYear: DgPerson // 2027-28
}
