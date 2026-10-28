import { useQuery } from '@tanstack/react-query'
import type {
  DistrictDirectoryResponse,
  RawMember,
  RawBODMember,
  DistrictCommitteeMember,
  CommitteeCategory,
  DistrictCommitteeResult,
  SubCommittee,
  ClubBODSummary,
  ClubMember,
  ClubDetailsData,
  ClubPresident,
  ClubSecretary,
  ClubBODMember,
} from '../types/api'
import type { CommitteeDetailsData } from './useCommitteeDetails'
import geetikaSalujaPhoto from '../assets/images/overrides/geetika-saluja.jpg'

// ---------------------------------------------------------------------------
// Single source of truth — the unified district-directory API.
// One GET request returns the district committee, every committee group, and
// every club (board + members). All hooks below read from this one cached
// response via react-query `select`, so the network is hit exactly once.
// ---------------------------------------------------------------------------

const DISTRICT = '3055'
const ROTARY_YEAR = '2026-27'

// Bearer token for the API. Overridable via VITE_RZ_API_TOKEN; the committed
// fallback is the token supplied for this district. NOTE: this token is
// embedded in the client bundle and has an expiry — rotate it via the env var.
const API_TOKEN =
  (import.meta.env.VITE_RZ_API_TOKEN as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6Ijg0MDUwMyIsIm5hbWUiOiJLYWxwZXNoIEEiLCJlbWFpbCI6IndlYkBrYWl6ZW5pbmZvdGVjaC5jb20iLCJyb2xlcyI6IkFkbWluLE1lbWJlciIsImxvZ2luVHlwZSI6Im1vYmlsZSIsIm1lbWJlclR5cGUiOiJtZW1iZXIiLCJpbWVpIjoiMWMxMTZjOTBjNTgzNjdiN2MzMjJmYzdkZDIyYmQ1YTMiLCJleHAiOjE3ODMxNjIxNjAsImlzcyI6Ikp3dElzc3VlciIsImF1ZCI6Ikp3dEF1ZGllbmNlIn0.EkKMZEHbNfTkwvVno70xb-m3Yu0ZSx_cHlws4a8dyH8'

const API_PATH = `/api/district-directory/${DISTRICT}?rotaryYear=${ROTARY_YEAR}`

// The API only whitelists CORS for the deployed origin, not localhost.
// In dev we route through the Vite proxy (`/rzapi` → rizones45678.org/API) to
// stay same-origin; in production we call the whitelisted origin directly.
const API_URL = import.meta.env.DEV ? `/rzapi${API_PATH}` : `https://rizones45678.org/API${API_PATH}`

export const directoryQueryKey = ['districtDirectory', DISTRICT, ROTARY_YEAR] as const

export async function fetchDistrictDirectory(): Promise<DistrictDirectoryResponse> {
  // `cache: 'no-store'` so the browser never serves a stale copy of the directory
  // JSON — a photo/field a member updated must show on the next load, not an old
  // snapshot. (The API sends no cache headers, so this is defensive.)
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`District directory request failed: ${res.status}`)
  return res.json()
}

/**
 * Base hook over the unified directory. All domain hooks call this with a
 * `select` transform, so they share a single cached fetch (same query key).
 */
export function useDistrictDirectory<T = DistrictDirectoryResponse>(
  select?: (data: DistrictDirectoryResponse) => T,
  enabled = true,
) {
  return useQuery({
    queryKey: directoryQueryKey,
    queryFn: fetchDistrictDirectory,
    select,
    enabled,
    staleTime: 30 * 60 * 1000,
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Member/club images are served from the API's OWN host (rizones45678.org/API),
// which is the authoritative, up-to-date store — the same origin the directory JSON
// comes from. (rotaryindia.org mirrors most files but LAGS: newly-uploaded photos
// 404 there until they sync, so a recent upload showed blank.) ProfilePhotoPath /
// ClubLogoPath come as leading-slash paths ("/Documents/directory/x.jpg");
// profile_photo / committeePhoto come as bare filenames living under
// /Documents/directory/. Already-absolute URLs pass through untouched.
export const IMAGE_HOST = 'https://rizones45678.org/API'

// Per-person photo overrides, keyed by the API photo's file name (last path
// segment). Lets a specific member's photo be replaced with a bundled local image
// wherever it appears, without altering any of their data. Resolved before the
// rotaryindia.org host is applied.
const PHOTO_OVERRIDES: Record<string, string> = {
  'geetika_saluja_profiel_picture_10082024095715PM.jpg': geetikaSalujaPhoto,
}

export function resolveImg(path?: string | null): string {
  if (!path) return ''
  const p = String(path).trim()
  if (!p || p === 'null' || p === 'undefined') return ''
  const file = p.split('/').pop() || ''
  if (PHOTO_OVERRIDES[file]) return PHOTO_OVERRIDES[file]
  // Locally-extracted DG/spouse photos (cropped from the DG-directory PDF for members
  // the API had no photo for) live under public/dg-pdf/ and are served by the app
  // itself — they must NOT be prefixed with the rotaryindia.org host.
  if (p.startsWith('/dg-pdf/')) return p
  if (/^https?:\/\//i.test(p)) return p
  if (p.startsWith('/')) return `${IMAGE_HOST}${p}`
  return `${IMAGE_HOST}/Documents/directory/${p}`
}

// The unified API returns ISO datetimes ("1990-05-13T00:00:00"); the UI
// renders day/month. Parse the date part directly to avoid timezone drift.
export function isoToDayMonth(iso?: string | null): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso))
  return m ? `${m[3]}/${m[2]}` : ''
}

// ISO datetime → DD/MM/YYYY (date part only, no timezone drift).
export function isoToDMY(iso?: string | null): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso))
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

// The "fullest available" birthday: DD/MM/YYYY when the year is a PLAUSIBLE real birth year,
// otherwise just DD/MM. The API stores 1900 (and occasionally a current/future year) as a
// "no year" placeholder for most members — so a complete DD/MM/YYYY is only shown for the
// minority whose real year is present; everyone else keeps the day/month the cards already show.
export function isoToBirthday(iso?: string | null): string {
  const dmy = isoToDMY(iso)
  const m = /\/(\d{4})$/.exec(dmy)
  if (!m) return isoToDayMonth(iso)
  const y = Number(m[1])
  const maxYear = new Date().getFullYear() - 5 // a member born in the last few years is bogus
  return y >= 1920 && y <= maxYear ? dmy : isoToDayMonth(iso)
}

// "13:30:00" / "13:30" → "01:30 PM". Empty for missing/unparseable input.
export function to12Hour(t?: string | null): string {
  if (!t) return ''
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t).trim())
  if (!m) return ''
  let h = Number(m[1])
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${m[2]} ${ampm}`
}

function pick(...vals: Array<string | null | undefined>): string {
  for (const v of vals) {
    if (v != null && String(v).trim() !== '') return String(v)
  }
  return ''
}

// ---------------------------------------------------------------------------
// Profile backfill. The unified API sometimes returns a committee/group member
// WITHOUT joining their master profile (only name/phone/email/photo, no DOB,
// classification or spouse — even though the member filled those in). The same
// person almost always appears with a COMPLETE record elsewhere in the response
// (their club membership, board seat, etc.). We index every complete record by
// mobile / email / Rotary id and backfill the thin committee records from it.
// ---------------------------------------------------------------------------
interface ProfileFields {
  name: string
  BirthDate?: string | null
  AnniversaryDate?: string | null
  classification?: string | null
  spouseName?: string | null
  spouseDob?: string | null
  spousePhoto?: string | null
  ProfilePhotoPath?: string | null
  ClubName?: string | null
}
type ProfileIndex = Map<string, ProfileFields>

const norm10 = (s?: string | null) => String(s ?? '').replace(/\D/g, '').replace(/^91/, '').slice(-10)

// Loose identity guard: at least one 3+ char name token in common (avoids a
// shared-mobile match landing on a spouse's profile).
function sameName(a: string, b: string): boolean {
  const toks = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3),
    )
  const ta = toks(a)
  for (const t of toks(b)) if (ta.has(t)) return true
  return false
}

function indexOneProfile(idx: ProfileIndex, m: RawMember): void {
  // Only records that actually carry profile detail are worth indexing.
  const classification = pick(m.classification, m.MemberIntroduction)
  if (!m.BirthDate && !classification && !m.spouseName) return
  const fields: ProfileFields = {
    name: pick(m.MemberName, m.committeeName, m.name),
    BirthDate: m.BirthDate,
    AnniversaryDate: m.AnniversaryDate,
    classification,
    spouseName: m.spouseName,
    spouseDob: m.spouseDob,
    spousePhoto: m.spousePhoto,
    ProfilePhotoPath: m.ProfilePhotoPath,
    ClubName: m.ClubName,
  }
  const keys = [
    norm10(m.PrimaryMobileNumber) && 'm:' + norm10(m.PrimaryMobileNumber),
    String(m.EmailId ?? '').trim() && 'e:' + String(m.EmailId).trim().toLowerCase(),
    String(m.RotaryId ?? '').trim() && 'r:' + String(m.RotaryId).trim(),
  ].filter(Boolean) as string[]
  for (const k of keys) if (!idx.has(k)) idx.set(k, fields) // first (richest) record wins
}

function buildProfileIndex(data: DistrictDirectoryResponse): ProfileIndex {
  const idx: ProfileIndex = new Map()
  for (const c of data.clubs ?? []) {
    for (const m of c.members ?? []) indexOneProfile(idx, m)
    for (const b of c.boardOfDirectors ?? []) indexOneProfile(idx, b)
  }
  for (const m of data.districtCommittee ?? []) indexOneProfile(idx, m)
  for (const g of data.groups ?? []) {
    for (const m of g.members ?? []) indexOneProfile(idx, m)
    for (const s of g.subGroups ?? []) for (const m of s.members ?? []) indexOneProfile(idx, m)
  }
  return idx
}

/**
 * Map of member profile id → resolved profile-photo URL, built across EVERY section
 * of the directory. Lets a view that is NOT itself API-driven — the static Council of
 * Governors — show the SAME photo a member has on their club/committee cards, so a
 * person never appears with two different photos. Uses `ProfilePhotoPath` (the member
 * master photo), which is identical regardless of which list the member is read from.
 */
export function selectMemberPhotos(data: DistrictDirectoryResponse): Map<number, string> {
  const map = new Map<number, string>()
  const add = (m: RawMember) => {
    const pk = m.pk_member_master_profile_id
    if (pk == null || map.has(pk)) return
    const url = resolveImg(m.ProfilePhotoPath)
    if (url) map.set(pk, url)
  }
  for (const c of data.clubs ?? []) {
    for (const m of c.members ?? []) add(m)
    for (const b of c.boardOfDirectors ?? []) add(b)
  }
  for (const m of data.districtCommittee ?? []) add(m)
  for (const g of data.groups ?? []) {
    for (const m of g.members ?? []) add(m)
    for (const s of g.subGroups ?? []) for (const m of s.members ?? []) add(m)
  }
  return map
}

function lookupProfile(idx: ProfileIndex, m: RawMember): ProfileFields | undefined {
  const name = pick(m.committeeName, m.name, m.MemberName)
  const keys = [
    norm10(m.committeeMobile) && 'm:' + norm10(m.committeeMobile),
    norm10(m.mobile) && 'm:' + norm10(m.mobile),
    norm10(m.PrimaryMobileNumber) && 'm:' + norm10(m.PrimaryMobileNumber),
    String(m.committeeEmail ?? m.email ?? m.EmailId ?? '').trim() &&
      'e:' + String(m.committeeEmail ?? m.email ?? m.EmailId).trim().toLowerCase(),
    String(m.RotaryId ?? '').trim() && 'r:' + String(m.RotaryId).trim(),
  ].filter(Boolean) as string[]
  for (const k of keys) {
    const hit = idx.get(k)
    if (hit && (!name || !hit.name || sameName(name, hit.name))) return hit
  }
  return undefined
}

// Map any committee/group member record → the DistrictCommitteeMember shape the
// cards expect. The unified API now carries `classification` and a spouse block
// (`spouseName`/`spouseDob`/`spousePhoto`) ON the member record — read them
// directly (classification falls back to `MemberIntroduction`). When this record's
// master-profile join is missing, `idx` backfills the gaps from the same person's
// complete record elsewhere in the response.
function mapCommitteeMember(m: RawMember, idx?: ProfileIndex): DistrictCommitteeMember {
  const p = idx ? lookupProfile(idx, m) : undefined
  const spouseDob = isoToDayMonth(pick(m.spouseDob, p?.spouseDob))
  return {
    DistrictDesignation: pick(m.districtDesignation, m.district_designation),
    name: pick(m.committeeName, m.name, m.MemberName),
    ClubName: pick(m.ClubName, m.club_name),
    MobileNumber: pick(m.committeeMobile, m.mobile, m.PrimaryMobileNumber),
    BloodGroup: pick(m.BloodGroup),
    Bloodgrp: pick(m.BloodGroup),
    MailID: pick(m.committeeEmail, m.email, m.EmailId),
    Address: '',
    DOB: isoToDayMonth(pick(m.BirthDate, p?.BirthDate)),
    DOBFull: isoToBirthday(pick(m.BirthDate, p?.BirthDate)),
    DOA: isoToDayMonth(pick(m.AnniversaryDate, p?.AnniversaryDate)),
    RotaryID: pick(m.RotaryId),
    img: resolveImg(pick(m.ProfilePhotoPath, m.committeePhoto, m.profile_photo, p?.ProfilePhotoPath)),
    SpouseName: pick(m.spouseName, p?.spouseName),
    SpousePhoto: resolveImg(pick(m.spousePhoto, p?.spousePhoto)),
    SpouseDOB: spouseDob,
    Spouse_DOB: spouseDob,
    Spouse_Mobile_Number: '',
    SpouseMobileNumber: '',
    SpouseMobile: '',
    Keywords: pick(m.classification, m.MemberIntroduction, p?.classification),
    classification: pick(m.classification, m.MemberIntroduction, p?.classification),
    // Carried through for the master export's appendix dedup (merge the same person across cards).
    pk_member_master_profile_id: m.pk_member_master_profile_id ?? undefined,
  }
}

// The unified API repeats some committee members (e.g. a person listed twice in
// the same committee). De-duplicate by person + role so each record shows once.
function dedupeMembers(list: DistrictCommitteeMember[]): DistrictCommitteeMember[] {
  const seen = new Set<string>()
  const out: DistrictCommitteeMember[] = []
  for (const m of list) {
    const key = [
      (m.RotaryID || '').trim(),
      (m.name || '').trim().toLowerCase(),
      (m.MobileNumber || '').trim(),
      (m.DistrictDesignation || '').trim().toLowerCase(),
    ].join('|')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(m)
  }
  return out
}

// ---------------------------------------------------------------------------
// Selectors — pure transforms from the unified response to the existing UI
// types. Exported for reuse by hooks and tests.
// ---------------------------------------------------------------------------

/** Executive committee = the top-level districtCommittee array (DG team). */
export function selectExecutiveCommittee(data: DistrictDirectoryResponse): DistrictCommitteeMember[] {
  const idx = buildProfileIndex(data)
  return dedupeMembers((data.districtCommittee ?? []).map((m) => mapCommitteeMember(m, idx)))
}

// Display-name overrides for committee groups whose API `groupName` differs from the
// wording the directory should show. Keyed by the exact API groupName.
const GROUP_NAME_OVERRIDES: Record<string, string> = {
  'Regional coordinators': 'Regional Co-ordinators',
}

/** Directory category cards = the committee groups. */
export function selectCategories(data: DistrictDirectoryResponse): CommitteeCategory[] {
  return [...(data.groups ?? [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((g) => ({
      Fk_DistrictCommitteeID: String(g.id),
      name: GROUP_NAME_OVERRIDES[g.groupName] ?? g.groupName,
    }))
}

export function selectDistrictCommitteeResult(data: DistrictDirectoryResponse): DistrictCommitteeResult {
  return { members: selectExecutiveCommittee(data), categories: selectCategories(data) }
}

/** Details for one committee group: its direct members + its sub-committees. */
export function selectCommitteeDetails(
  data: DistrictDirectoryResponse,
  committeeId: string,
): CommitteeDetailsData {
  const group = (data.groups ?? []).find((g) => String(g.id) === String(committeeId))
  if (!group) return { subCommittees: [], subCommitteeMembers: [], directMembers: [] }

  const subCommittees: SubCommittee[] = [...(group.subGroups ?? [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((s) => ({ pk_District_sub_Committee_id: String(s.id), name: s.subGroupName }))

  // Members come ordered by the API's per-member sort_order, which ranks roles
  // (Chair → Co-Chair → …). Preserve that ordering; the cards must not be
  // re-sorted alphabetically downstream.
  const byRole = (a: RawMember, b: RawMember) =>
    Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)

  const idx = buildProfileIndex(data)
  const subCommitteeMembers: DistrictCommitteeMember[] = (group.subGroups ?? []).flatMap((s) =>
    dedupeMembers(
      [...(s.members ?? [])].sort(byRole).map((m) => ({
        ...mapCommitteeMember(m, idx),
        fk_District_sub_Committee_id: String(s.id),
      })),
    ),
  )

  const directMembers = dedupeMembers([...(group.members ?? [])].sort(byRole).map((m) => mapCommitteeMember(m, idx)))
  return { subCommittees, subCommitteeMembers, directMembers }
}

// Find the Club President / Club Secretary in a board of directors. Uses exact
// designation match so "Immediate Past President", "President Elect" and
// "Club Vice President" are not mistaken for the sitting president.
function findByDesignation(bod: RawBODMember[], designation: string): RawBODMember | undefined {
  return (bod ?? []).find((b) => (b.designationName ?? '').trim() === designation)
}

// There is no per-club zone field, but the "Zonal Team" group's "Zone N"
// sub-groups list each zone's Assistant Governors. Index AG → zone number so each
// club's Zone No can be resolved from its AG.
function buildZoneIndex(data: DistrictDirectoryResponse): { byId: Map<number, string>; byMobile: Map<string, string> } {
  const byId = new Map<number, string>()
  const byMobile = new Map<string, string>()
  const zonal = (data.groups ?? []).find((g) => /zonal team/i.test(g.groupName ?? ''))
  for (const s of zonal?.subGroups ?? []) {
    const num = (s.subGroupName?.match(/\d+/) ?? [''])[0]
    if (!num) continue
    for (const m of s.members ?? []) {
      if (m.pk_member_master_profile_id != null) byId.set(m.pk_member_master_profile_id, num)
      for (const mob of [norm10(m.PrimaryMobileNumber), norm10(m.committeeMobile)]) if (mob) byMobile.set(mob, num)
    }
  }
  return { byId, byMobile }
}

// Manual corrections where the unified API's AG→club assignment is stale, so the Zone
// No (derived from the AG's "Zone N" sub-group) comes out wrong on the club card. Keyed
// by pk_club_id (the same id as src/data/zoneClubOrder.ts). Ahmedabad Atulya (35207)
// moved Zone 6 → Zone 3 per the "AGs, Presidents & Secretaries" sheet, but the API still
// links it to the Zone-6 AG. `agName` can be set too when the displayed AG must change.
const CLUB_AG_OVERRIDES: Record<string, { zoneNo?: string; agName?: string }> = {
  '35207': { zoneNo: '3' }, // Ahmedabad Atulya → Zone 3
}

/** All clubs with their AG/President/Secretary summary (BOD listing page). */
export function selectClubsBOD(data: DistrictDirectoryResponse): ClubBODSummary[] {
  const zone = buildZoneIndex(data)
  return [...(data.clubs ?? [])]
    .sort((a, b) => (a.club?.ClubName ?? '').localeCompare(b.club?.ClubName ?? ''))
    .map((entry) => {
      const pres = findByDesignation(entry.boardOfDirectors, 'Club President')
      const sec = findByDesignation(entry.boardOfDirectors, 'Club Secretary')
      const info = entry.club
      const ag = entry.assistantGovernor
      const id = String(info?.pk_club_id ?? '')
      const override = CLUB_AG_OVERRIDES[id]
      const meeting = [info?.MeetingDay ?? '', to12Hour(info?.MeetingFromTime)]
        .filter(Boolean)
        .join(', ')
      return {
        grpID: id,
        clubId: id,
        clubRotaryId: pick(info?.ClubRotaryId, id),
        clubName: info?.ClubName ?? '',
        charterDate: isoToDMY(info?.ClubCharterDate),
        memberCount: String((entry.members ?? []).length),
        meeting,
        venue: pick(info?.MeetingAddress),
        // Assistant Governor comes on the club entry; Zone No is derived from the
        // AG's "Zone N" sub-group in the Zonal Team (no per-club zone field exists).
        zoneNo:
          override?.zoneNo ??
          (ag?.pk_member_master_profile_id != null ? zone.byId.get(ag.pk_member_master_profile_id) : undefined) ??
          zone.byMobile.get(norm10(pick(ag?.agMobile, ag?.PrimaryMobileNumber))) ??
          '',
        AG_Name: override?.agName ?? pick(ag?.agName, ag?.MemberName),
        AG_MobileNumber: pick(ag?.agMobile, ag?.PrimaryMobileNumber),
        AG_EmailID: pick(ag?.agEmail, ag?.EmailId),
        AG_DOB: isoToDayMonth(ag?.BirthDate),
        AG_Photo: resolveImg(pick(ag?.agPhoto, ag?.ProfilePhotoPath)),
        President_member_name: pres?.MemberName ?? '',
        President_member_email_id: pres?.EmailId ?? '',
        President_member_mobile_no: pres?.PrimaryMobileNumber ?? '',
        President_Classification: pick(pres?.classification, pres?.MemberIntroduction),
        President_DOB: isoToDayMonth(pres?.BirthDate),
        President_DOB_full: isoToBirthday(pres?.BirthDate),
        President_DOA: isoToDayMonth(pres?.AnniversaryDate),
        President_Profile_Photo: resolveImg(pres?.ProfilePhotoPath),
        President_Spouse_member_name: pick(pres?.spouseName),
        President_Spouse_DOB: isoToDayMonth(pres?.spouseDob),
        President_Spouse_Profile_Photo: resolveImg(pick(pres?.spousePhoto)),
        Secreatary_member_name: sec?.MemberName ?? '',
        Secreatary_email_id: sec?.EmailId ?? '',
        Secreatary_mobile_no: sec?.PrimaryMobileNumber ?? '',
        Secreatary_Classification: pick(sec?.classification, sec?.MemberIntroduction),
        Secreatary_DOB: isoToDayMonth(sec?.BirthDate),
        Secreatary_DOB_full: isoToBirthday(sec?.BirthDate),
        Secreatary_DOA: isoToDayMonth(sec?.AnniversaryDate),
        Secreatary_Profile_Photo: resolveImg(sec?.ProfilePhotoPath),
        Secreatary_Spouse_member_name: pick(sec?.spouseName),
        Secreatary_Spouse_DOB: isoToDayMonth(sec?.spouseDob),
        Secreatary_Spouse_Profile_Photo: resolveImg(pick(sec?.spousePhoto)),
      }
    })
}

function findClub(data: DistrictDirectoryResponse, clubId: string) {
  return (data.clubs ?? []).find((c) => String(c.club?.pk_club_id) === String(clubId))
}

/** Full detail for one club: basic info, president, secretary, board. */
export function selectClubDetails(data: DistrictDirectoryResponse, clubId: string): ClubDetailsData | null {
  const entry = findClub(data, clubId)
  if (!entry) return null
  const info = entry.club
  const presRaw = findByDesignation(entry.boardOfDirectors, 'Club President')
  const secRaw = findByDesignation(entry.boardOfDirectors, 'Club Secretary')

  const president: ClubPresident | null = presRaw
    ? {
        President_name: presRaw.MemberName ?? '',
        President_photo: resolveImg(presRaw.ProfilePhotoPath),
        Mobile_number: presRaw.PrimaryMobileNumber ?? '',
        President_DOB: isoToDayMonth(presRaw.BirthDate),
        President_EmialID: presRaw.EmailId ?? '',
        DOA: isoToDayMonth(presRaw.AnniversaryDate),
        address: '',
        RotaryID: presRaw.RotaryId ?? '',
        Classification: pick(presRaw.classification, presRaw.MemberIntroduction),
        President_spouse_name: pick(presRaw.spouseName),
        President_spouse_DOB: isoToDayMonth(presRaw.spouseDob),
        President_photo_spouse: resolveImg(pick(presRaw.spousePhoto)),
      }
    : null

  const secretary: ClubSecretary | null = secRaw
    ? {
        Secretary_name: secRaw.MemberName ?? '',
        Secretary_photo: resolveImg(secRaw.ProfilePhotoPath),
        Mobile_number: secRaw.PrimaryMobileNumber ?? '',
        Secretary_DOB: isoToDayMonth(secRaw.BirthDate),
        Secretary_EmialID: secRaw.EmailId ?? '',
        DOA: isoToDayMonth(secRaw.AnniversaryDate),
        address: '',
        RotaryID: secRaw.RotaryId ?? '',
        Classification: secRaw.MemberIntroduction ?? '',
        Secretary_spouse_name: '',
        Secretary_spouse_DOB: '',
        Secretary_photo_spouse: '',
      }
    : null

  // Board accordion: every other director, one card per person. A member can
  // hold several positions (e.g. be President *and* Vice President), so we
  // exclude the president/secretary by person id (not just the BOD row id) and
  // de-duplicate the rest by person — keeping the highest-ranked role
  // (lowest designationSortOrder). Rows without a profile id fall back to the
  // row id so distinct people are never merged.
  const personKey = (b: RawBODMember) =>
    b.pk_member_master_profile_id != null ? `p${b.pk_member_master_profile_id}` : `e${b.id}`
  const excludedPersons = new Set(
    [presRaw, secRaw].filter((b): b is RawBODMember => b != null).map(personKey),
  )
  const seen = new Set<string>()
  const bod: ClubBODMember[] = [...(entry.boardOfDirectors ?? [])]
    .sort((a, b) => (a.designationSortOrder ?? 0) - (b.designationSortOrder ?? 0))
    .filter((b) => {
      const key = personKey(b)
      if (excludedPersons.has(key) || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((b) => ({
      Name: b.MemberName ?? '',
      Designation: b.designationName ?? '',
      ClubName: info?.ClubName ?? '',
      Mobile_number: b.PrimaryMobileNumber ?? '',
      member_date_of_birth: isoToDayMonth(b.BirthDate),
      member_date_of_wedding: isoToDayMonth(b.AnniversaryDate),
      Emailid: b.EmailId ?? '',
      address: '',
      member_profile_photo_path: resolveImg(b.ProfilePhotoPath),
      classification: pick(b.classification, b.MemberIntroduction),
      SpouseName: pick(b.spouseName),
      SpouseDOB: isoToDayMonth(b.spouseDob),
    }))

  return {
    basicInfo: {
      Club_Name: info?.ClubName ?? '',
      Club_ID: pick(info?.ClubRotaryId, String(info?.pk_club_id ?? '')),
      Charter_Date: info?.ClubCharterDate ?? '',
      Membership: String((entry.members ?? []).length),
      Meeting_Day: info?.MeetingDay ?? '',
      Club_Address: info?.MeetingAddress ?? '',
    },
    // Per-club Assistant Governor is not provided by the unified API.
    ag: null,
    president,
    secretary,
    bod,
    presidentPhoto: '',
  }
}

/** Members roster for one club. */
export function selectClubMembers(data: DistrictDirectoryResponse, clubId: string): ClubMember[] {
  const entry = findClub(data, clubId)
  if (!entry) return []
  return (entry.members ?? []).map((m) => ({
    memberName: m.MemberName ?? '',
    MemberName: m.MemberName ?? '',
    membermobile: m.PrimaryMobileNumber ?? '',
    MemberMobile: m.PrimaryMobileNumber ?? '',
    designation: '',
    Designation: '',
    pic: resolveImg(m.ProfilePhotoPath),
    groupName: '',
    MemberDOB: isoToDayMonth(m.BirthDate),
    MemberDOA: isoToDayMonth(m.AnniversaryDate),
    MemberEmail: m.EmailId ?? '',
    MemberAddress: '',
    classification: pick(m.classification, m.MemberIntroduction),
    SpouseName: pick(m.spouseName),
    SpouseDOB: isoToDayMonth(m.spouseDob),
    SpousePhoto: resolveImg(pick(m.spousePhoto)),
    SpouseMobile: '',
  }))
}
