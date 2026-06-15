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
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
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

// All member/club images are served from rotaryindia.org. ProfilePhotoPath /
// ClubLogoPath come as leading-slash paths ("/Documents/directory/x.jpg");
// profile_photo / committeePhoto come as bare filenames living under
// /Documents/directory/. Already-absolute URLs pass through untouched.
export const IMAGE_HOST = 'https://rotaryindia.org'

export function resolveImg(path?: string | null): string {
  if (!path) return ''
  const p = String(path).trim()
  if (!p || p === 'null' || p === 'undefined') return ''
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

function pick(...vals: Array<string | null | undefined>): string {
  for (const v of vals) {
    if (v != null && String(v).trim() !== '') return String(v)
  }
  return ''
}

// Map any committee/group member record → the DistrictCommitteeMember shape
// the cards expect. Spouse fields are absent in the unified API, so they
// are emitted empty (the UI hides empty spouse sections).
function mapCommitteeMember(m: RawMember): DistrictCommitteeMember {
  return {
    DistrictDesignation: pick(m.districtDesignation, m.district_designation),
    name: pick(m.committeeName, m.name, m.MemberName),
    ClubName: pick(m.ClubName, m.club_name),
    MobileNumber: pick(m.committeeMobile, m.mobile, m.PrimaryMobileNumber),
    BloodGroup: pick(m.BloodGroup),
    Bloodgrp: pick(m.BloodGroup),
    MailID: pick(m.committeeEmail, m.email, m.EmailId),
    Address: '',
    DOB: isoToDayMonth(m.BirthDate),
    DOA: isoToDayMonth(m.AnniversaryDate),
    RotaryID: pick(m.RotaryId),
    img: resolveImg(pick(m.ProfilePhotoPath, m.committeePhoto, m.profile_photo)),
    SpouseName: '',
    SpousePhoto: '',
    SpouseDOB: '',
    Spouse_DOB: '',
    Spouse_Mobile_Number: '',
    SpouseMobileNumber: '',
    SpouseMobile: '',
    Keywords: pick(m.MemberIntroduction),
    classification: pick(m.MemberIntroduction),
  }
}

// ---------------------------------------------------------------------------
// Selectors — pure transforms from the unified response to the existing UI
// types. Exported for reuse by hooks and tests.
// ---------------------------------------------------------------------------

/** Executive committee = the top-level districtCommittee array (DG team). */
export function selectExecutiveCommittee(data: DistrictDirectoryResponse): DistrictCommitteeMember[] {
  return (data.districtCommittee ?? []).map(mapCommitteeMember)
}

/** Directory category cards = the committee groups. */
export function selectCategories(data: DistrictDirectoryResponse): CommitteeCategory[] {
  return [...(data.groups ?? [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((g) => ({ Fk_DistrictCommitteeID: String(g.id), name: g.groupName }))
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

  const subCommitteeMembers: DistrictCommitteeMember[] = (group.subGroups ?? []).flatMap((s) =>
    (s.members ?? []).map((m) => ({
      ...mapCommitteeMember(m),
      fk_District_sub_Committee_id: String(s.id),
    })),
  )

  const directMembers = (group.members ?? []).map(mapCommitteeMember)
  return { subCommittees, subCommitteeMembers, directMembers }
}

// Find the Club President / Club Secretary in a board of directors. Uses exact
// designation match so "Immediate Past President", "President Elect" and
// "Club Vice President" are not mistaken for the sitting president.
function findByDesignation(bod: RawBODMember[], designation: string): RawBODMember | undefined {
  return (bod ?? []).find((b) => (b.designationName ?? '').trim() === designation)
}

/** All clubs with their AG/President/Secretary summary (BOD listing page). */
export function selectClubsBOD(data: DistrictDirectoryResponse): ClubBODSummary[] {
  return [...(data.clubs ?? [])]
    .sort((a, b) => (a.club?.ClubName ?? '').localeCompare(b.club?.ClubName ?? ''))
    .map((entry) => {
      const pres = findByDesignation(entry.boardOfDirectors, 'Club President')
      const sec = findByDesignation(entry.boardOfDirectors, 'Club Secretary')
      const id = String(entry.club?.pk_club_id ?? '')
      return {
        grpID: id,
        clubId: id,
        clubName: entry.club?.ClubName ?? '',
        // Per-club Assistant Governor is not provided by the unified API.
        AG_Name: '',
        AG_MobileNumber: '',
        AG_EmailID: '',
        AG_DOB: '',
        AG_Photo: '',
        President_member_name: pres?.MemberName ?? '',
        President_member_email_id: pres?.EmailId ?? '',
        President_member_mobile_no: pres?.PrimaryMobileNumber ?? '',
        President_Classification: pres?.MemberIntroduction ?? '',
        President_Profile_Photo: resolveImg(pres?.ProfilePhotoPath),
        President_Spouse_member_name: '',
        President_Spouse_DOB: '',
        President_Spouse_Profile_Photo: '',
        Secreatary_member_name: sec?.MemberName ?? '',
        Secreatary_email_id: sec?.EmailId ?? '',
        Secreatary_mobile_no: sec?.PrimaryMobileNumber ?? '',
        Secreatary_Classification: sec?.MemberIntroduction ?? '',
        Secreatary_Profile_Photo: resolveImg(sec?.ProfilePhotoPath),
        Secreatary_Spouse_member_name: '',
        Secreatary_Spouse_DOB: '',
        Secreatary_Spouse_Profile_Photo: '',
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
        Classification: presRaw.MemberIntroduction ?? '',
        President_spouse_name: '',
        President_spouse_DOB: '',
        President_photo_spouse: '',
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
    SpouseName: '',
    SpouseDOB: '',
    SpousePhoto: '',
    SpouseMobile: '',
  }))
}
